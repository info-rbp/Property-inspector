import { config } from '../config/env';
import { logger } from '../utils/logger';

// Default entitlements if service is unreachable or not configured
const FALLBACK_ENTITLEMENTS = {
  plan: 'BASIC',
  features: ['PDF_REPORT'],
  subscriptionStatus: 'UNKNOWN'
};

export const billingClient = {
  getEntitlements: async (tenantId: string) => {
    if (!config.BILLING_SERVICE_URL) {
      return FALLBACK_ENTITLEMENTS;
    }

    try {
      const response = await fetch(`${config.BILLING_SERVICE_URL}/v1/tenants/${tenantId}/entitlements`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Auth': config.SERVICE_AUTH_SECRET
        }
      });

      if (!response.ok) {
        logger.warn(`Billing Service returned ${response.status} for tenant ${tenantId}`);
        return FALLBACK_ENTITLEMENTS;
      }

      return await response.json();
    } catch (error) {
      logger.error('[Billing] Failed to fetch entitlements', error);
      return FALLBACK_ENTITLEMENTS;
    }
  }
};