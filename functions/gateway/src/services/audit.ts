import { BaseClient } from './base';
import { env } from '../config/env';

class AuditService extends BaseClient {
  constructor() {
    super('Audit', env.AUDIT_SERVICE_URL);
  }

  async appendEvent(tenantId: string, eventType: string, actor: string, metadata: any) {
    // Fire and forget logic usually, but here we await with strict timeout
    try {
      await this.client.post('/v1/events', {
        eventType, actor, metadata, timestamp: new Date().toISOString()
      }, {
        headers: { 'X-Tenant-ID': tenantId }
      });
    } catch (e) {
      console.error(`[Audit] Failed to append event: ${e}`);
    }
  }
}

export const auditService = new AuditService();