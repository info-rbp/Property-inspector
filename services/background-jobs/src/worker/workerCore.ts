import { db, jobsCollection, Timestamp } from '../lib/firestore';
import { enqueueWorkerTask } from '../lib/tasks';
import { JobDocument, JobStatus, JobType } from '../types';
import { calculateBackoff } from '../utils/backoff';
import { analysisHandler } from '../handlers/analysisHandler';
import { reportHandler } from '../handlers/reportHandler';

export const processJob = async (jobId: string, idempotencyKey: string) => {
  const jobRef = jobsCollection.doc(jobId);

  // 1. Transactional State Transition: QUEUED -> RUNNING
  // This ensures only one worker instance runs this job at a time.
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(jobRef);
      if (!doc.exists) throw new Error(`Job ${jobId} not found`);
      
      const job = doc.data() as JobDocument;

      // Idempotency Check
      if (job.status === JobStatus.SUCCEEDED || job.status === JobStatus.FAILED || job.status === JobStatus.CANCELLED || job.status === JobStatus.DEAD_LETTER) {
        console.log(`[Worker] Job ${jobId} already finished as ${job.status}. Skipping.`);
        return; 
      }

      // Check key to prevent duplicate delivery of same task ID processing
      // In this simple model, we trust the status check mostly, but comparing keys is safer for retries.
      
      t.update(jobRef, {
        status: JobStatus.RUNNING,
        startedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        attempts: job.attempts + 1,
      });
    });
  } catch (err) {
    console.log(`[Worker] Transaction skipped or failed for ${jobId}`, err);
    return; // Stop execution if transaction failed (likely race condition handled by another worker)
  }

  // 2. Load latest state to execute
  const doc = await jobRef.get();
  const job = doc.data() as JobDocument;
  
  // Double check status after transaction
  if (job.status !== JobStatus.RUNNING) return;

  const updateProgress = async (percent: number, message: string) => {
    await jobRef.update({
      updatedAt: Timestamp.now(),
      progress: { percent, message, step: 'PROCESSING' }
    });
  };

  try {
    let result;
    
    // 3. Dispatch to Handlers
    switch (job.type) {
      case JobType.ANALYZE_ROOM:
      case JobType.ANALYZE_INSPECTION:
        result = await analysisHandler(job, updateProgress);
        break;
      case JobType.GENERATE_REPORT:
        result = await reportHandler(job, updateProgress);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    // 4. Success Completion
    await jobRef.update({
      status: JobStatus.SUCCEEDED,
      finishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      result: result,
      progress: { percent: 100, message: 'Complete', step: 'DONE' }
    });

    console.log(`[Worker] Job ${jobId} succeeded.`);

    // 5. Optional Webhook Delivery could go here

  } catch (error: any) {
    console.error(`[Worker] Job ${jobId} failed:`, error);

    const attempts = job.attempts;
    const maxAttempts = job.maxAttempts;

    if (attempts >= maxAttempts) {
      // Dead Letter
      await jobRef.update({
        status: JobStatus.DEAD_LETTER,
        finishedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        error: {
          code: 'MAX_ATTEMPTS_EXCEEDED',
          message: error.message || 'Unknown error',
          details: error.stack
        }
      });
    } else {
      // Retry Logic
      const runAfter = calculateBackoff(attempts);
      
      await jobRef.update({
        status: JobStatus.QUEUED, // Reset to Queued
        updatedAt: Timestamp.now(),
        runAfter: runAfter,
        error: {
          code: 'RETRYABLE_ERROR',
          message: error.message
        }
      });

      // Re-enqueue task with schedule
      // We rely on the JobService logic, but here we call task queue directly
      await enqueueWorkerTask(jobId, job.idempotencyKey, runAfter);
      console.log(`[Worker] Job ${jobId} re-enqueued for attempt ${attempts + 1} at ${runAfter.toDate()}`);
    }
  }
};
