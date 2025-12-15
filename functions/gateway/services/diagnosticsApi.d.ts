import { ServiceCardData, TestRun, SyntheticTestType, TenantDetail } from '../types';
/**
 * DIAGNOSTICS API LAYER
 * In a real app, these would be server-side Next.js API Routes
 */
export declare const diagnosticsApi: {
    getOverview: () => Promise<ServiceCardData[]>;
    getServiceDetails: (name: string) => Promise<any>;
    runSyntheticTest: (type: SyntheticTestType, updateCallback: (run: TestRun) => void) => Promise<void>;
    searchTenants: (query: string) => Promise<TenantDetail[]>;
    performOp: (action: string, payload: any) => Promise<boolean>;
};
