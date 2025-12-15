interface AuditLogParams {
    tenantId?: string;
    actorUserId?: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: any;
}
export declare const logAudit: (params: AuditLogParams) => Promise<void>;
export {};
