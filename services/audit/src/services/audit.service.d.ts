import { AuditEventInput, AuditEventStored } from '../models/audit-schema';
export declare class AuditService {
    /**
     * Writes a new immutable audit event.
     * Handles hash chaining and payload offloading.
     */
    static writeEvent(input: AuditEventInput): Promise<string>;
    /**
     * Reads history for a specific entity.
     */
    static getEntityHistory(tenantId: string, entityType: string, entityId: string): Promise<(AuditEventStored | {
        payloadDownloadUrl: string;
        auditEventId: string;
        tenantId: string;
        entityType: import("../models/audit-schema").EntityType;
        entityId: string;
        eventType: import("../models/audit-schema").EventType;
        actorType: import("../models/audit-schema").ActorType;
        actorId: string;
        timestamp: string;
        sourceService: import("../models/audit-schema").SourceService;
        correlationId?: string;
        payloadHash: string;
        previousHash?: string;
        payload?: Record<string, any>;
        payloadRef?: string;
        schemaVersion: number;
        immutable: true;
    })[]>;
    /**
     * Generates a summary for an inspection (Dispute Review).
     */
    static getInspectionSummary(tenantId: string, inspectionId: string): Promise<{
        inspectionId: string;
        totalEvents: number;
        firstSeen: string;
        lastUpdate: string;
        aiStats: {
            analysisRequests: number;
            modelsUsed: string[];
        };
        compliance: {
            humanOverridesCount: number;
            isFinalized: boolean;
            finalizedAt: string | undefined;
        };
    }>;
    /**
     * Export Stream (Simplified for this example)
     */
    static getExportQuery(tenantId: string, startDate?: string, endDate?: string): Promise<FirebaseFirestore.Query<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>>;
}
