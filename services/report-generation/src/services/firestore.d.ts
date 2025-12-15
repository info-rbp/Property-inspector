import { ReportMetadata } from '../types';
export declare class DatabaseService {
    getReport(reportId: string): Promise<ReportMetadata | null>;
    saveReport(data: ReportMetadata): Promise<void>;
    getReportsByInspection(tenantId: string, inspectionId: string): Promise<ReportMetadata[]>;
    /**
     * Checks if a finalized report already exists for this inspection
     */
    getFinalizedReport(tenantId: string, inspectionId: string): Promise<ReportMetadata | null>;
    updateReportStatus(reportId: string, updates: Partial<ReportMetadata>): Promise<void>;
}
export declare const dbService: DatabaseService;
