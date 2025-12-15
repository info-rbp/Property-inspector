import { BrandingConfig, InspectionData } from '../types';
export declare class IntegrationService {
    getBranding(tenantId: string): Promise<BrandingConfig>;
    getInspectionData(tenantId: string, inspectionId: string): Promise<InspectionData>;
}
export declare const integrationService: IntegrationService;
