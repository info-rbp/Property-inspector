"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processJob = void 0;
const firestore_1 = require("../lib/firestore");
const tasks_1 = require("../lib/tasks");
const types_2 = require("../types");
const backoff_1 = require("../utils/backoff");
const analysisHandler_1 = require("../handlers/analysisHandler");
const reportHandler_1 = require("../handlers/reportHandler");
const processJob = async (jobId, idempotencyKey) => {
    const jobRef = firestore_1.jobsCollection.doc(jobId);
    // 1. Transactional State Transition: QUEUED -> RUNNING
    // This ensures only one worker instance runs this job at a time.
    try {
        await firestore_1.db.runTransaction(async (t) => {
            const doc = await t.get(jobRef);
            if (!doc.exists)
                throw new Error(`Job ${jobId} not found`);
            const job = doc.data();
            // Idempotency Check
            if (job.status === types_2.JobStatus.SUCCEEDED || job.status === types_2.JobStatus.FAILED || job.status === types_2.JobStatus.CANCELLED || job.status === types_2.JobStatus.DEAD_LETTER) {
                console.log(`[Worker] Job ${jobId} already finished as ${job.status}. Skipping.`);
                return;
            }
            // Check key to prevent duplicate delivery of same task ID processing
            // In this simple model, we trust the status check mostly, but comparing keys is safer for retries.
            t.update(jobRef, {
                status: types_2.JobStatus.RUNNING,
                startedAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
                attempts: job.attempts + 1,
            });
        });
    }
    catch (err) {
        console.log(`[Worker] Transaction skipped or failed for ${jobId}`, err);
        return; // Stop execution if transaction failed (likely race condition handled by another worker)
    }
    // 2. Load latest state to execute
    const doc = await jobRef.get();
    const job = doc.data();
    // Double check status after transaction
    if (job.status !== types_2.JobStatus.RUNNING)
        return;
    const updateProgress = async (percent, message) => {
        await jobRef.update({
            updatedAt: firestore_1.Timestamp.now(),
            progress: { percent, message, step: 'PROCESSING' }
        });
    };
    try {
        let result;
        // 3. Dispatch to Handlers
        switch (job.type) {
            case types_2.JobType.ANALYZE_ROOM:
            case types_2.JobType.ANALYZE_INSPECTION:
                result = await (0, analysisHandler_1.analysisHandler)(job, updateProgress);
                break;
            case types_2.JobType.GENERATE_REPORT:
                result = await (0, reportHandler_1.reportHandler)(job, updateProgress);
                break;
            default:
                throw new Error(`Unknown job type: ${job.type}`);
        }
        // 4. Success Completion
        await jobRef.update({
            status: types_2.JobStatus.SUCCEEDED,
            finishedAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            result: result,
            progress: { percent: 100, message: 'Complete', step: 'DONE' }
        });
        console.log(`[Worker] Job ${jobId} succeeded.`);
        // 5. Optional Webhook Delivery could go here
    }
    catch (error) {
        console.error(`[Worker] Job ${jobId} failed:`, error);
        const attempts = job.attempts;
        const maxAttempts = job.maxAttempts;
        if (attempts >= maxAttempts) {
            // Dead Letter
            await jobRef.update({
                status: types_2.JobStatus.DEAD_LETTER,
                finishedAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
                error: {
                    code: 'MAX_ATTEMPTS_EXCEEDED',
                    message: error.message || 'Unknown error',
                    details: error.stack
                }
            });
        }
        else {
            // Retry Logic
            const runAfter = (0, backoff_1.calculateBackoff)(attempts);
            await jobRef.update({
                status: types_2.JobStatus.QUEUED, // Reset to Queued
                updatedAt: firestore_1.Timestamp.now(),
                runAfter: runAfter,
                error: {
                    code: 'RETRYABLE_ERROR',
                    message: error.message
                }
            });
            // Re-enqueue task with schedule
            // We rely on the JobService logic, but here we call task queue directly
            await (0, tasks_1.enqueueWorkerTask)(jobId, job.idempotencyKey, runAfter);
            console.log(`[Worker] Job ${jobId} re-enqueued for attempt ${attempts + 1} at ${runAfter.toDate()}`);
        }
    }
};
exports.processJob = processJob;
