import { v4 as uuidv4 } from 'uuid';
import { jobsCollection, Timestamp, db } from '../lib/firestore';
import { enqueueWorkerTask } from '../lib/tasks';
import { CreateJobRequest, JobDocument, JobStatus, JobType } from '../types';
import { config } from '../config';

export class JobService {
  
  async createJob(data: CreateJobRequest): Promise<JobDocument> {
    const jobId = `job_${uuidv4()}`;
    const now = Timestamp.now();
    
    // Default RunImmediately
    const runAfter = now;

    const jobData: JobDocument = {
      jobId,
      tenantId: data.tenantId,
      type: data.type,
      status: JobStatus.QUEUED,
      attempts: 0,
      maxAttempts: config.defaults.maxAttempts,
      createdAt: now,
      updatedAt: now,
      runAfter: runAfter,
      input: data.input,
      createdByUserId: data.createdByUserId,
      idempotencyKey: uuidv4(), // Initial execution key
    };

    // 1. Save to Firestore
    await jobsCollection.doc(jobId).set(jobData);

    // 2. Enqueue Cloud Task
    await enqueueWorkerTask(jobId, jobData.idempotencyKey, runAfter);

    return jobData;
  }

  async getJob(jobId: string, tenantId: string): Promise<JobDocument | null> {
    const doc = await jobsCollection.doc(jobId).get();
    if (!doc.exists) return null;

    const data = doc.data() as JobDocument;
    
    // Strict Tenant Isolation
    if (data.tenantId !== tenantId) return null;

    return data;
  }

  async listJobs(tenantId: string, inspectionId: string, status?: JobStatus, limit = 20): Promise<JobDocument[]> {
    let query = jobsCollection
      .where('tenantId', '==', tenantId)
      .where('input.inspectionId', '==', inspectionId);

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as JobDocument);
  }

  async cancelJob(jobId: string, tenantId: string): Promise<void> {
    const ref = jobsCollection.doc(jobId);
    
    await db.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (!doc.exists) throw new Error('Job not found');
      
      const data = doc.data() as JobDocument;
      if (data.tenantId !== tenantId) throw new Error('Unauthorized');

      if ([JobStatus.SUCCEEDED, JobStatus.FAILED, JobStatus.DEAD_LETTER].includes(data.status)) {
        return; // Already finished
      }

      t.update(ref, {
        status: JobStatus.CANCELLED,
        updatedAt: Timestamp.now(),
        'progress.message': 'Cancelled by user',
      });
    });
  }

  // Bonus: Detect stuck jobs (Run via Cloud Scheduler)
  async reQueueStuckJobs(timeoutMinutes: number = 15): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const cutoffTimestamp = Timestamp.fromDate(cutoff);

    // Find jobs stuck in RUNNING for too long
    const snapshot = await jobsCollection
      .where('status', '==', JobStatus.RUNNING)
      .where('updatedAt', '<', cutoffTimestamp)
      .limit(50)
      .get();

    let count = 0;
    
    // Process in batches
    const batch = db.batch();
    
    for (const doc of snapshot.docs) {
      const job = doc.data() as JobDocument;
      console.log(`[StuckDetector] Re-queueing stuck job ${job.jobId}`);
      
      // Reset to QUEUED to let worker pick it up again
      batch.update(doc.ref, {
        status: JobStatus.QUEUED,
        updatedAt: Timestamp.now(),
        'progress.message': 'Recovered from stuck state',
      });
      
      // Trigger new task
      await enqueueWorkerTask(job.jobId, job.idempotencyKey);
      count++;
    }

    if (count > 0) {
      await batch.commit();
    }
    
    return count;
  }
}

export const jobService = new JobService();