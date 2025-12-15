import { BaseClient } from './base';
declare class ReportService extends BaseClient {
    constructor();
    finalizeReport(tenantId: string, reportId: string): Promise<any>;
}
export declare const reportService: ReportService;
export {};
