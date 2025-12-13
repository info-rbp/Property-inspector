import { billingClient } from '../clients/billingClient';

export const getTenantEntitlements = async (tenantId: string) => {
  // Identity Service is NO LONGER the authority on plans.
  // We fetch from Billing Service or use a fallback.
  return await billingClient.getEntitlements(tenantId);
};