"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantEntitlements = void 0;
const billingClient_1 = require("../clients/billingClient");
const getTenantEntitlements = async (tenantId) => {
    // Identity Service is NO LONGER the authority on plans.
    // We fetch from Billing Service or use a fallback.
    return await billingClient_1.billingClient.getEntitlements(tenantId);
};
exports.getTenantEntitlements = getTenantEntitlements;
