"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = exports.JobService = void 0;
const uuid_1 = require("uuid");
const firestore_1 = require("../lib/firestore");
const tasks_1 = require("../lib/tasks");
const types_2 = require("../types");
const config_1 = require("../config");
class JobService {
    async createJob(data) {
        const jobId = `job_${(0, uuid_1.v4)()}`;
        const now = firestore_1.Timestamp.now();
        // Default RunImmediately
        const runAfter = now;
        const jobData = {
            jobId,
            tenantId: data.tenantId,
            type: data.type,
            status: types_2.JobStatus.QUEUED,
            attempts: 0,
            maxAttempts: config_1.config.defaults.maxAttempts,
            createdAt: now,
            updatedAt: now,
            runAfter: runAfter,
            input: data.input,
            createdByUserId: data.createdByUserId,
            idempotencyKey: (0, uuid_1.v4)(), // Initial execution key
        };
        // 1. Save to Firestore
        await firestore_1.jobsCollection.doc(jobId).set(jobData);
        // 2. Enqueue Cloud Task
        await (0, tasks_1.enqueueWorkerTask)(jobId, jobData.idempotencyKey, runAfter);
        return jobData;
    }
    async getJob(jobId, tenantId) {
        const doc = await firestore_1.jobsCollection.doc(jobId).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        // Strict Tenant Isolation
        if (data.tenantId !== tenantId)
            return null;
        return data;
    }
    async listJobs(tenantId, inspectionId, status, limit = 20) {
        let query = firestore_1.jobsCollection
            .where('tenantId', '==', tenantId)
            .where('input.inspectionId', '==', inspectionId);
        if (status) {
            query = query.where('status', '==', status);
        }
        query = query.orderBy('createdAt', 'desc').limit(limit);
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    }
    async cancelJob(jobId, tenantId) {
        const ref = firestore_1.jobsCollection.doc(jobId);
        await firestore_1.db.runTransaction(async (t) => {
            const doc = await t.get(ref);
            if (!doc.exists)
                throw new Error('Job not found');
            const data = doc.data();
            if (data.tenantId !== tenantId)
                throw new Error('Unauthorized');
            if ([types_2.JobStatus.SUCCEEDED, types_2.JobStatus.FAILED, types_2.JobStatus.DEAD_LETTER].includes(data.status)) {
                return; // Already finished
            }
            t.update(ref, {
                status: types_2.JobStatus.CANCELLED,
                updatedAt: firestore_1.Timestamp.now(),
                'progress.message': 'Cancelled by user',
            });
        });
    }
    // Bonus: Detect stuck jobs (Run via Cloud Scheduler)
    async reQueueStuckJobs(timeoutMinutes = 15) {
        const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
        const cutoffTimestamp = firestore_1.Timestamp.fromDate(cutoff);
        // Find jobs stuck in RUNNING for too long
        const snapshot = await firestore_1.jobsCollection
            .where('status', '==', types_2.JobStatus.RUNNING)
            .where('updatedAt', '<', cutoffTimestamp)
            .limit(50)
            .get();
        let count = 0;
        // Process in batches
        const batch = firestore_1.db.batch();
        for (const doc of snapshot.docs) {
            const job = doc.data();
            console.log(`[StuckDetector] Re-queueing stuck job ${job.jobId}`);
            // Reset to QUEUED to let worker pick it up again
            batch.update(doc.ref, {
                status: types_2.JobStatus.QUEUED,
                updatedAt: firestore_1.Timestamp.now(),
                'progress.message': 'Recovered from stuck state',
            });
            // Trigger new task
            await (0, tasks_1.enqueueWorkerTask)(job.jobId, job.idempotencyKey);
            count++;
        }
        if (count > 0) {
            await batch.commit();
        }
        return count;
    }
}
exports.JobService = JobService;
exports.jobService = new JobService();
