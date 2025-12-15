import { BaseClient } from './base';
import { JobType } from '@prisma/client';
declare class JobsService extends BaseClient {
    constructor();
    createJob(tenantId: string, type: JobType, payload: any, correlationId: string): Promise<{
        jobId: string;
        status: string;
    }>;
}
export declare const jobsService: JobsService;
export {};
