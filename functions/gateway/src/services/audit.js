"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const base_1 = require("./base");
const env_1 = require("../config/env");
class AuditService extends base_1.BaseClient {
    constructor() {
        super('Audit', env_1.env.AUDIT_SERVICE_URL);
    }
    async appendEvent(tenantId, eventType, actor, metadata) {
        // Fire and forget logic usually, but here we await with strict timeout
        try {
            await this.client.post('/v1/events', {
                eventType, actor, metadata, timestamp: new Date().toISOString()
            }, {
                headers: { 'X-Tenant-ID': tenantId }
            });
        }
        catch (e) {
            console.error(`[Audit] Failed to append event: ${e}`);
        }
    }
}
exports.auditService = new AuditService();
