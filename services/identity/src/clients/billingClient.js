"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
// Default entitlements if service is unreachable or not configured
const FALLBACK_ENTITLEMENTS = {
    plan: 'BASIC',
    features: ['PDF_REPORT'],
    subscriptionStatus: 'UNKNOWN'
};
exports.billingClient = {
    getEntitlements: async (tenantId) => {
        if (!env_1.config.BILLING_SERVICE_URL) {
            return FALLBACK_ENTITLEMENTS;
        }
        try {
            const response = await fetch(`${env_1.config.BILLING_SERVICE_URL}/v1/tenants/${tenantId}/entitlements`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Auth': env_1.config.SERVICE_AUTH_SECRET
                }
            });
            if (!response.ok) {
                logger_1.logger.warn(`Billing Service returned ${response.status} for tenant ${tenantId}`);
                return FALLBACK_ENTITLEMENTS;
            }
            return await response.json();
        }
        catch (error) {
            logger_1.logger.error('[Billing] Failed to fetch entitlements', error);
            return FALLBACK_ENTITLEMENTS;
        }
    }
};
