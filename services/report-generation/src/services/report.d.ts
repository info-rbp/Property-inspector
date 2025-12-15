import { InspectionData, ReportMetadata } from '../types';
export declare class ReportService {
    /**
     * Orchestrates report generation
     */
    generateReport(tenantId: string, inspectionId: string, templateId: string, finalize: boolean, providedData?: InspectionData): Promise<ReportMetadata>;
    /**
     * Finalizes an existing draft
     */
    finalizeReport(tenantId: string, reportId: string): Promise<ReportMetadata>;
    getReport(tenantId: string, reportId: string): Promise<ReportMetadata>;
    getDownloadUrl(tenantId: string, reportId: string): Promise<string>;
    listReports(tenantId: string, inspectionId: string): Promise<ReportMetadata[]>;
}
export declare const reportService: ReportService;
