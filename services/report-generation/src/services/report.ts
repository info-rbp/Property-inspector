import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from './firestore.ts';
import { templateService } from './templates';
import { integrationService } from './integrations';
import { pdfService } from './pdf';
import { storageService } from './storage';
import { AppError } from '../utils/errors';
import { InspectionData, ReportMetadata, ReportStatus } from '../types';

export class ReportService {
  
  /**
   * Orchestrates report generation
   */
  async generateReport(
    tenantId: string,
    inspectionId: string,
    templateId: string,
    finalize: boolean,
    providedData?: InspectionData // Optional: Data can be pushed or pulled
  ): Promise<ReportMetadata> {
    
    // 1. Check if finalized report already exists (Idempotency & Locking)
    const existingFinal = await dbService.getFinalizedReport(tenantId, inspectionId);
    if (existingFinal) {
      // If client requests finalization but it's already done, return the existing one
      // If client requests draft, strictly speaking, we could allow it, but usually a finalized state locks the inspection.
      // We will reject if trying to regenerate a finalized report.
      throw new AppError('REPORT_FINALIZED', 'Finalized reports cannot be regenerated', 409);
    }

    // 2. Fetch Data (if not provided)
    const data = providedData || await integrationService.getInspectionData(tenantId, inspectionId);
    
    // Security check: ensure provided data matches tenant
    if (data.tenantId !== tenantId) {
      throw new AppError('TENANT_MISMATCH', 'Data tenant ID does not match request context', 403);
    }

    // 3. Fetch Branding
    const branding = await integrationService.getBranding(tenantId);

    // 4. Render HTML
    const html = templateService.render(templateId, data, branding);

    // 5. Generate PDF
    const pdfBuffer = await pdfService.generatePdf(html);

    // 6. Calculate Metadata
    const reportId = uuidv4();
    const checksum = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
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
    await storageService.uploadPdf(storagePath, pdfBuffer, {
      reportId,
      inspectionId,
      templateId,
    });

    // 9. Construct Record
    const metadata: ReportMetadata = {
      reportId,
      tenantId,
      inspectionId,
      inspectionType: data.inspectionType,
      status: finalize ? 'finalized' : 'draft',
      templateId,
      templateVersion: templateService.getVersion(templateId),
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
    await dbService.saveReport(metadata);

    return metadata;
  }

  /**
   * Finalizes an existing draft
   */
  async finalizeReport(tenantId: string, reportId: string): Promise<ReportMetadata> {
    const report = await dbService.getReport(reportId);

    if (!report) throw new AppError('REPORT_NOT_FOUND', 'Report not found', 404);
    if (report.tenantId !== tenantId) throw new AppError('UNAUTHORIZED', 'Access denied', 403);
    if (report.status === 'finalized') throw new AppError('ALREADY_FINALIZED', 'Report is already finalized', 409);

    const updates: Partial<ReportMetadata> = {
      status: 'finalized',
      lockedAt: new Date().toISOString(),
    };

    await dbService.updateReportStatus(reportId, updates);
    
    return { ...report, ...updates };
  }

  async getReport(tenantId: string, reportId: string): Promise<ReportMetadata> {
    const report = await dbService.getReport(reportId);
    if (!report) throw new AppError('REPORT_NOT_FOUND', 'Report not found', 404);
    if (report.tenantId !== tenantId) throw new AppError('UNAUTHORIZED', 'Access denied', 403);
    return report;
  }

  async getDownloadUrl(tenantId: string, reportId: string): Promise<string> {
    const report = await this.getReport(tenantId, reportId);
    return await storageService.getSignedUrl(report.pdfStoragePath);
  }

  async listReports(tenantId: string, inspectionId: string): Promise<ReportMetadata[]> {
    return await dbService.getReportsByInspection(tenantId, inspectionId);
  }
}

export const reportService = new ReportService();