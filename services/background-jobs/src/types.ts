import { z } from 'zod';
import { Timestamp } from '@google-cloud/firestore';

export enum JobType {
  ANALYZE_ROOM = 'ANALYZE_ROOM',
  ANALYZE_INSPECTION = 'ANALYZE_INSPECTION',
  GENERATE_REPORT = 'GENERATE_REPORT',
  FINALIZE_REPORT = 'FINALIZE_REPORT',
}

export enum JobStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  DEAD_LETTER = 'DEAD_LETTER',
}

export enum AnalysisMode {
  FAST = 'FAST',
  STANDARD = 'STANDARD',
  DEEP = 'DEEP',
}

// Zod Schema for Creating a Job
export const CreateJobSchema = z.object({
  type: z.nativeEnum(JobType),
  tenantId: z.string().min(1),
  inspectionId: z.string().min(1),
  createdByUserId: z.string().optional(),
  input: z.object({
    roomIds: z.array(z.string()).optional(),
    roomId: z.string().optional(),
    mediaIds: z.array(z.string()).optional(),
    imageUrls: z.array(z.string().url()).optional(),
    analysisMode: z.nativeEnum(AnalysisMode).default(AnalysisMode.STANDARD),
    reportTemplateId: z.string().optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
  }).passthrough(),
});

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
  
  // Timestamps (stored as Firestore Timestamp)
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
