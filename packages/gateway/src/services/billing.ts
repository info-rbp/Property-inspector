import { BaseClient } from './base';
import { env } from '../config/env';

class BillingService extends BaseClient {
  constructor() {
    super('Billing', env.BILLING_SERVICE_URL);
  }

  async checkEntitlement(tenantId: string, feature: string) {
    try {
      const { data } = await this.client.get(`/v1/entitlements/${feature}`, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      return data as { allowed: boolean; remaining: number; reason?: string };
    } catch (e) {
      this.handleError(e, 'checkEntitlement');
    }
  }

  async recordUsage(tenantId: string, metric: string, quantity: number, referenceId: string) {
    try {
      await this.client.post('/v1/usage', {
        metric, quantity, referenceId
      }, {
        headers: { 'X-Tenant-ID': tenantId, 'Idempotency-Key': `usage-${referenceId}` }
      });
    } catch (e) {
      console.warn(`[Billing] Failed to record usage: ${e}`);
      // Fail open for usage recording to avoid blocking user flow, but log error
    }
  }
}

export const billingService = new BillingService();