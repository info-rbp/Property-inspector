"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const zod_1 = require("zod");
const report_1 = require("../services/report");
const errors_1 = require("../utils/errors");
// Schemas
const generateSchema = zod_1.z.object({
    inspectionId: zod_1.z.string(),
    templateId: zod_1.z.string(),
    finalize: zod_1.z.boolean().default(false),
    inspectionData: zod_1.z.any().optional(), // In a real app, strict validation of deep object
});
class ReportController {
    async generate(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId)
            return res.status(400).json({ error: 'Missing x-tenant-id header' });
        try {
            const body = generateSchema.parse(req.body);
            const result = await report_1.reportService.generateReport(tenantId, body.inspectionId, body.templateId, body.finalize, body.inspectionData);
            res.status(201).json(result);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.errors } });
            }
            (0, errors_1.handleError)(res, err, req.params.requestId || 'unknown');
        }
    }
    async finalize(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        const { reportId } = req.params;
        try {
            const result = await report_1.reportService.finalizeReport(tenantId, reportId);
            res.json(result);
        }
        catch (err) {
            (0, errors_1.handleError)(res, err, 'finalize');
        }
    }
    async getMetadata(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        const { reportId } = req.params;
        try {
            const result = await report_1.reportService.getReport(tenantId, reportId);
            res.json(result);
        }
        catch (err) {
            (0, errors_1.handleError)(res, err, 'getMetadata');
        }
    }
    async download(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        const { reportId } = req.params;
        try {
            const url = await report_1.reportService.getDownloadUrl(tenantId, reportId);
            res.json({ url });
        }
        catch (err) {
            (0, errors_1.handleError)(res, err, 'download');
        }
    }
    async list(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        const { inspectionId } = req.params;
        try {
            const reports = await report_1.reportService.listReports(tenantId, inspectionId);
            res.json({ reports });
        }
        catch (err) {
            (0, errors_1.handleError)(res, err, 'list');
        }
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
