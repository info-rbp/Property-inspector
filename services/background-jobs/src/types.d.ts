import { z } from 'zod';
import { Timestamp } from '@google-cloud/firestore';
export declare enum JobType {
    ANALYZE_ROOM = "ANALYZE_ROOM",
    ANALYZE_INSPECTION = "ANALYZE_INSPECTION",
    GENERATE_REPORT = "GENERATE_REPORT",
    FINALIZE_REPORT = "FINALIZE_REPORT"
}
export declare enum JobStatus {
    QUEUED = "QUEUED",
    RUNNING = "RUNNING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    DEAD_LETTER = "DEAD_LETTER"
}
export declare enum AnalysisMode {
    FAST = "FAST",
    STANDARD = "STANDARD",
    DEEP = "DEEP"
}
export declare const CreateJobSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof JobType>;
    tenantId: z.ZodString;
    inspectionId: z.ZodString;
    createdByUserId: z.ZodOptional<z.ZodString>;
    input: z.ZodObject<{
        roomIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        roomId: z.ZodOptional<z.ZodString>;
        mediaIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        imageUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        analysisMode: z.ZodDefault<z.ZodNativeEnum<typeof AnalysisMode>>;
        reportTemplateId: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH"]>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        roomIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        roomId: z.ZodOptional<z.ZodString>;
        mediaIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        imageUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        analysisMode: z.ZodDefault<z.ZodNativeEnum<typeof AnalysisMode>>;
        reportTemplateId: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH"]>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        roomIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        roomId: z.ZodOptional<z.ZodString>;
        mediaIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        imageUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        analysisMode: z.ZodDefault<z.ZodNativeEnum<typeof AnalysisMode>>;
        reportTemplateId: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH"]>>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    input: {
        priority: "LOW" | "NORMAL" | "HIGH";
        analysisMode: AnalysisMode;
        roomIds?: string[] | undefined;
        roomId?: string | undefined;
        mediaIds?: string[] | undefined;
        imageUrls?: string[] | undefined;
        reportTemplateId?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    type: JobType;
    inspectionId: string;
    tenantId: string;
    createdByUserId?: string | undefined;
}, {
    input: {
        priority?: "LOW" | "NORMAL" | "HIGH" | undefined;
        roomIds?: string[] | undefined;
        roomId?: string | undefined;
        mediaIds?: string[] | undefined;
        imageUrls?: string[] | undefined;
        analysisMode?: AnalysisMode | undefined;
        reportTemplateId?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    type: JobType;
    inspectionId: string;
    tenantId: string;
    createdByUserId?: string | undefined;
}>;
export type CreateJobRequest = z.infer<typeof CreateJobSchema>;
export interface JobProgress {
    step: string;
    percent: number;
    message: string;
}
export interface JobError {
    code: string;
    message: string;
    details?: any;
}
export interface JobDocument {
    jobId: string;
    tenantId: string;
    type: JobType;
    status: JobStatus;
    attempts: number;
    maxAttempts: number;
    runAfter: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    startedAt?: Timestamp;
    finishedAt?: Timestamp;
    input: any;
    progress?: JobProgress;
    result?: any;
    error?: JobError;
    createdByUserId?: string;
    idempotencyKey: string;
}
