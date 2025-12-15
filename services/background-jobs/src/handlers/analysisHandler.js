"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisHandler = void 0;
const types_2 = require("../types");
const jobService_1 = require("../services/jobService");
const analysisHandler = async (job, updateProgress) => {
    console.log(`[Analysis] Starting analysis for inspection ${job.input.inspectionId}`);
    await updateProgress(10, 'Preparing media for analysis');
    try {
        // 1. Call External AI Service
        // In a real scenario, this might be a long polling or callback architecture, 
        // but for this example, we assume a sync waiting call (or short async)
        const payload = {
            tenantId: job.tenantId,
            inspectionId: job.input.inspectionId,
            roomId: job.input.roomId,
            mediaIds: job.input.mediaIds,
            imageUrls: job.input.imageUrls,
            mode: job.input.analysisMode,
        };
        await updateProgress(30, 'Sending data to AI engine');
        // Simulate external API call latency
        // const response = await axios.post(`${config.services.analysisUrl}/analyze`, payload);
        // const result = response.data;
        // MOCK RESPONSE
        await new Promise(r => setTimeout(r, 2000));
        const result = {
            issues: [{ id: 'issue_1', severity: 'HIGH', label: 'Water Damage' }],
            summary: 'Detected potential water intrusion.',
            confidence: 0.95
        };
        await updateProgress(90, 'Saving results');
        // 2. Chaining: Check if we need to trigger the Report Generation
        // If this job was type ANALYZE_INSPECTION (aggregation), we might trigger reporting.
        if (job.type === types_2.JobType.ANALYZE_INSPECTION) {
            console.log(`[Analysis] Analysis complete. Chaining Report Generation.`);
            await jobService_1.jobService.createJob({
                tenantId: job.tenantId,
                inspectionId: job.input.inspectionId,
                type: types_2.JobType.GENERATE_REPORT,
                input: {
                    analysisMode: job.input.analysisMode ?? types_2.AnalysisMode.STANDARD,
                    priority: 'HIGH',
                    analysisJobId: job.jobId,
                },
            });
        }
        return result;
    }
    catch (error) {
        console.error(`[Analysis] External call failed: ${error.message}`);
        throw error; // Rethrow to trigger retry logic in workerCore
    }
};
exports.analysisHandler = analysisHandler;
