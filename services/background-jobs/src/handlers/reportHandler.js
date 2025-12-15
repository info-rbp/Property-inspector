"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportHandler = void 0;
const reportHandler = async (job, updateProgress) => {
    console.log(`[Report] Generating report for ${job.input.inspectionId}`);
    await updateProgress(20, 'Fetching inspection data');
    // MOCK: Call report service
    const payload = {
        inspectionId: job.input.inspectionId,
        templateId: job.input.reportTemplateId || 'default_v1',
        branding: { tenantId: job.tenantId }
    };
    await updateProgress(50, 'Rendering PDF');
    // Simulate delay
    await new Promise(r => setTimeout(r, 3000));
    // const response = await axios.post(`${config.services.reportUrl}/generate`, payload);
    const result = {
        documentId: 'doc_xyz_789',
        downloadUrl: `https://storage.googleapis.com/reports/${job.tenantId}/${job.input.inspectionId}.pdf`,
        generatedAt: new Date().toISOString()
    };
    await updateProgress(100, 'Report uploaded');
    return result;
};
exports.reportHandler = reportHandler;
