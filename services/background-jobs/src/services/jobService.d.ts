import { CreateJobRequest, JobDocument, JobStatus } from '../types';
export declare class JobService {
    createJob(data: CreateJobRequest): Promise<JobDocument>;
    getJob(jobId: string, tenantId: string): Promise<JobDocument | null>;
    listJobs(tenantId: string, inspectionId: string, status?: JobStatus, limit?: number): Promise<JobDocument[]>;
    cancelJob(jobId: string, tenantId: string): Promise<void>;
    reQueueStuckJobs(timeoutMinutes?: number): Promise<number>;
}
export declare const jobService: JobService;
