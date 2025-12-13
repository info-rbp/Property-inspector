
import { z } from 'zod';

// --- ENUMS ---

export enum EntityType {
  INSPECTION = 'inspection',
  ROOM = 'room',
  COMPONENT = 'component',
  PHOTO = 'photo',
  ANALYSIS = 'analysis',
  REPORT = 'report',
}

export enum ActorType {
  USER = 'user',
  SYSTEM = 'system',
  AI = 'ai',
}

export enum SourceService {
  INSPECTION_APP = 'inspection-app',
  ANALYSIS_APP = 'analysis-app',
  REPORT_APP = 'report-app',
  JOBS = 'jobs',
}

export enum EventType {
  // Photo & Evidence
  PHOTO_UPLOADED = 'PHOTO_UPLOADED',
  PHOTO_ATTACHED_TO_COMPONENT = 'PHOTO_ATTACHED_TO_COMPONENT',
  PHOTO_USED_IN_ANALYSIS = 'PHOTO_USED_IN_ANALYSIS',

  // AI Analysis
  AI_ANALYSIS_REQUESTED = 'AI_ANALYSIS_REQUESTED',
  AI_MODEL_SELECTED = 'AI_MODEL_SELECTED',
  AI_PROMPT_VERSION_USED = 'AI_PROMPT_VERSION_USED',
  AI_ANALYSIS_COMPLETED = 'AI_ANALYSIS_COMPLETED',
  AI_ANALYSIS_FAILED = 'AI_ANALYSIS_FAILED',

  // Human Interaction
  AI_SUGGESTION_ACCEPTED = 'AI_SUGGESTION_ACCEPTED',
  AI_SUGGESTION_EDITED = 'AI_SUGGESTION_EDITED',
  AI_SUGGESTION_REJECTED = 'AI_SUGGESTION_REJECTED',
  COMPONENT_STATUS_CHANGED = 'COMPONENT_STATUS_CHANGED',
  COMMENT_EDITED_MANUALLY = 'COMMENT_EDITED_MANUALLY',

  // Report Lifecycle
  REPORT_GENERATION_REQUESTED = 'REPORT_GENERATION_REQUESTED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_FINALIZED = 'REPORT_FINALIZED',
  REPORT_DOWNLOADED = 'REPORT_DOWNLOADED',
  REPORT_REGENERATE_BLOCKED = 'REPORT_REGENERATE_BLOCKED',
}

// --- SCHEMAS ---

export const AuditEventInputSchema = z.object({
  tenantId: z.string().min(1),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  actorType: z.nativeEnum(ActorType),
  actorId: z.string().min(1),
  sourceService: z.nativeEnum(SourceService),
  correlationId: z.string().optional(),
  payload: z.record(z.any()), // The actual data
});

// The structure stored in Firestore
export interface AuditEventStored {
  auditEventId: string;
  tenantId: string;
  entityType: EntityType;
  entityId: string;
  eventType: EventType;
  actorType: ActorType;
  actorId: string;
  timestamp: string; // ISO 8601
  sourceService: SourceService;
  correlationId?: string;
  
  // Integrity Fields
  payloadHash: string; // SHA256
  previousHash?: string; // For hash-chaining integrity
  
  // Storage logic
  payload?: Record<string, any>; // Inline if small
  payloadRef?: string; // GCS URI if large
  
  schemaVersion: number;
  immutable: true;
}

export type AuditEventInput = z.infer<typeof AuditEventInputSchema>;
