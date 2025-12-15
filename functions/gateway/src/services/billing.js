"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingService = void 0;
const base_1 = require("./base");
const env_1 = require("../config/env");
class BillingService extends base_1.BaseClient {
    constructor() {
        super('Billing', env_1.env.BILLING_SERVICE_URL);
    }
    async checkEntitlement(tenantId, feature) {
        try {
            const { data } = await this.client.get(`/v1/entitlements/${feature}`, {
                headers: { 'X-Tenant-ID': tenantId }
            });
            return data;
        }
        catch (e) {
            this.handleError(e, 'checkEntitlement');
        }
    }
    async recordUsage(tenantId, metric, quantity, referenceId) {
        try {
            await this.client.post('/v1/usage', {
                metric, quantity, referenceId
            }, {
                headers: { 'X-Tenant-ID': tenantId, 'Idempotency-Key': `usage-${referenceId}` }
            });
        }
        catch (e) {
            console.warn(`[Billing] Failed to record usage: ${e}`);
            // Fail open for usage recording to avoid blocking user flow, but log error
        }
    }
}
exports.billingService = new BillingService();
