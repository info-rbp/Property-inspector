import { BaseClient } from './base';
declare class BillingService extends BaseClient {
    constructor();
    checkEntitlement(tenantId: string, feature: string): Promise<{
        allowed: boolean;
        remaining: number;
        reason?: string;
    }>;
    recordUsage(tenantId: string, metric: string, quantity: number, referenceId: string): Promise<void>;
}
export declare const billingService: BillingService;
export {};
