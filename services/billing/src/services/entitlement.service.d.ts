import { EntitlementCheckResult } from '../types';
export declare const checkEntitlement: (tenantId: string, usageType: string, requestedQuantity?: number) => Promise<EntitlementCheckResult>;
