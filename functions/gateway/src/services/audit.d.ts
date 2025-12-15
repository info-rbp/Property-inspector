import { BaseClient } from './base';
declare class AuditService extends BaseClient {
    constructor();
    appendEvent(tenantId: string, eventType: string, actor: string, metadata: any): Promise<void>;
}
export declare const auditService: AuditService;
export {};
