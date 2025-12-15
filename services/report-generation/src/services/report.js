"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const firestore_ts_1 = require("./firestore.ts");
const templates_1 = require("./templates");
const integrations_1 = require("./integrations");
const pdf_1 = require("./pdf");
const storage_1 = require("./storage");
const errors_1 = require("../utils/errors");
class ReportService {
    /**
     * Orchestrates report generation
     */
    async generateReport(tenantId, inspectionId, templateId, finalize, providedData // Optional: Data can be pushed or pulled
    ) {
        // 1. Check if finalized report already exists (Idempotency & Locking)
        const existingFinal = await firestore_ts_1.dbService.getFinalizedReport(tenantId, inspectionId);
        if (existingFinal) {
            // If client requests finalization but it's already done, return the existing one
            // If client requests draft, strictly speaking, we could allow it, but usually a finalized state locks the inspection.
            // We will reject if trying to regenerate a finalized report.
            throw new errors_1.AppError('REPORT_FINALIZED', 'Finalized reports cannot be regenerated', 409);
        }
        // 2. Fetch Data (if not provided)
        const data = providedData || await integrations_1.integrationService.getInspectionData(tenantId, inspectionId);
        // Security check: ensure provided data matches tenant
        if (data.tenantId !== tenantId) {
            throw new errors_1.AppError('TENANT_MISMATCH', 'Data tenant ID does not match request context', 403);
        }
        // 3. Fetch Branding
        const branding = await integrations_1.integrationService.getBranding(tenantId);
        // 4. Render HTML
        const html = templates_1.templateService.render(templateId, data, branding);
        // 5. Generate PDF
        const pdfBuffer = await pdf_1.pdfService.generatePdf(html);
        // 6. Calculate Metadata
        const reportId = (0, uuid_1.v4)();
        const checksum = crypto_1.default.createHash('sha256').update(pdfBuffer).digest('hex');
        const storagePath = `${tenantId}/${inspectionId}/${reportId}.pdf`;
        // 7. Calculate Stats
        let roomCount = data.rooms.length;
        let photoCount = 0;
        let issueCount = 0;
        let majorIssueCount = 0;
        data.rooms.forEach(r => {
            r.components.forEach(c => {
                photoCount += c.photos.length;
                issueCount += c.issues.length;
                majorIssueCount += c.issues.filter(i => i.severity === 'major' || i.severity === 'critical').length;
            });
        });
        // 8. Upload to Storage
        await storage_1.storageService.uploadPdf(storagePath, pdfBuffer, {
            reportId,
            inspectionId,
            templateId,
        });
        // 9. Construct Record
        const metadata = {
            reportId,
            tenantId,
            inspectionId,
            inspectionType: data.inspectionType,
            status: finalize ? 'finalized' : 'draft',
            templateId,
            templateVersion: templates_1.templateService.getVersion(templateId),
            brandingVersion: branding.brandingVersion,
            generatedAt: new Date().toISOString(),
            pdfStoragePath: storagePath,
            pageCount: 0, // In a real Playwright impl, we can try to extract this, but it's hard with just buffer.
            checksum,
            lockedAt: finalize ? new Date().toISOString() : null,
            metadata: {
                roomCount,
                photoCount,
                issueCount,
                majorIssueCount
            }
        };
        // 10. Save to DB
        await firestore_ts_1.dbService.saveReport(metadata);
        return metadata;
    }
    /**
     * Finalizes an existing draft
     */
    async finalizeReport(tenantId, reportId) {
        const report = await firestore_ts_1.dbService.getReport(reportId);
        if (!report)
            throw new errors_1.AppError('REPORT_NOT_FOUND', 'Report not found', 404);
        if (report.tenantId !== tenantId)
            throw new errors_1.AppError('UNAUTHORIZED', 'Access denied', 403);
        if (report.status === 'finalized')
            throw new errors_1.AppError('ALREADY_FINALIZED', 'Report is already finalized', 409);
        const updates = {
            status: 'finalized',
            lockedAt: new Date().toISOString(),
        };
        await firestore_ts_1.dbService.updateReportStatus(reportId, updates);
        return { ...report, ...updates };
    }
    async getReport(tenantId, reportId) {
        const report = await firestore_ts_1.dbService.getReport(reportId);
        if (!report)
            throw new errors_1.AppError('REPORT_NOT_FOUND', 'Report not found', 404);
        if (report.tenantId !== tenantId)
            throw new errors_1.AppError('UNAUTHORIZED', 'Access denied', 403);
        return report;
    }
    async getDownloadUrl(tenantId, reportId) {
        const report = await this.getReport(tenantId, reportId);
        return await storage_1.storageService.getSignedUrl(report.pdfStoragePath);
    }
    async listReports(tenantId, inspectionId) {
        return await firestore_ts_1.dbService.getReportsByInspection(tenantId, inspectionId);
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
