import { z } from 'zod';
export declare enum EntityType {
    INSPECTION = "inspection",
    ROOM = "room",
    COMPONENT = "component",
    PHOTO = "photo",
    ANALYSIS = "analysis",
    REPORT = "report"
}
export declare enum ActorType {
    USER = "user",
    SYSTEM = "system",
    AI = "ai"
}
export declare enum SourceService {
    INSPECTION_APP = "inspection-app",
    ANALYSIS_APP = "analysis-app",
    REPORT_APP = "report-app",
    JOBS = "jobs"
}
export declare enum EventType {
    PHOTO_UPLOADED = "PHOTO_UPLOADED",
    PHOTO_ATTACHED_TO_COMPONENT = "PHOTO_ATTACHED_TO_COMPONENT",
    PHOTO_USED_IN_ANALYSIS = "PHOTO_USED_IN_ANALYSIS",
    AI_ANALYSIS_REQUESTED = "AI_ANALYSIS_REQUESTED",
    AI_MODEL_SELECTED = "AI_MODEL_SELECTED",
    AI_PROMPT_VERSION_USED = "AI_PROMPT_VERSION_USED",
    AI_ANALYSIS_COMPLETED = "AI_ANALYSIS_COMPLETED",
    AI_ANALYSIS_FAILED = "AI_ANALYSIS_FAILED",
    AI_SUGGESTION_ACCEPTED = "AI_SUGGESTION_ACCEPTED",
    AI_SUGGESTION_EDITED = "AI_SUGGESTION_EDITED",
    AI_SUGGESTION_REJECTED = "AI_SUGGESTION_REJECTED",
    COMPONENT_STATUS_CHANGED = "COMPONENT_STATUS_CHANGED",
    COMMENT_EDITED_MANUALLY = "COMMENT_EDITED_MANUALLY",
    REPORT_GENERATION_REQUESTED = "REPORT_GENERATION_REQUESTED",
    REPORT_GENERATED = "REPORT_GENERATED",
    REPORT_FINALIZED = "REPORT_FINALIZED",
    REPORT_DOWNLOADED = "REPORT_DOWNLOADED",
    REPORT_REGENERATE_BLOCKED = "REPORT_REGENERATE_BLOCKED"
}
export declare const AuditEventInputSchema: z.ZodObject<{
    tenantId: z.ZodString;
    entityType: z.ZodNativeEnum<typeof EntityType>;
    entityId: z.ZodString;
    eventType: z.ZodNativeEnum<typeof EventType>;
    actorType: z.ZodNativeEnum<typeof ActorType>;
    actorId: z.ZodString;
    sourceService: z.ZodNativeEnum<typeof SourceService>;
    correlationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    payload: Record<string, any>;
    eventType: EventType;
    entityType: EntityType;
    entityId: string;
    actorType: ActorType;
    actorId: string;
    sourceService: SourceService;
    correlationId?: string | undefined;
}, {
    tenantId: string;
    payload: Record<string, any>;
    eventType: EventType;
    entityType: EntityType;
    entityId: string;
    actorType: ActorType;
    actorId: string;
    sourceService: SourceService;
    correlationId?: string | undefined;
}>;
export interface AuditEventStored {
    auditEventId: string;
    tenantId: string;
    entityType: EntityType;
    entityId: string;
    eventType: EventType;
    actorType: ActorType;
    actorId: string;
    timestamp: string;
    sourceService: SourceService;
    correlationId?: string;
    payloadHash: string;
    previousHash?: string;
    payload?: Record<string, any>;
    payloadRef?: string;
    schemaVersion: number;
    immutable: true;
}
export type AuditEventInput = z.infer<typeof AuditEventInputSchema>;
