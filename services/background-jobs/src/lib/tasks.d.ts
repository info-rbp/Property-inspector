import { Timestamp } from '@google-cloud/firestore';
export declare const enqueueWorkerTask: (jobId: string, idempotencyKey: string, runAfter?: Timestamp) => Promise<string | null | undefined>;
