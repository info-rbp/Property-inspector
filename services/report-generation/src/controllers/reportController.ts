import { Request, Response } from 'express';
import { z } from 'zod';
import { reportService } from '../services/report';
import { handleError } from '../utils/errors';

// Schemas
const generateSchema = z.object({
  inspectionId: z.string(),
  templateId: z.string(),
  finalize: z.boolean().default(false),
  inspectionData: z.any().optional(), // In a real app, strict validation of deep object
});

export class ReportController {
  
  async generate(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).json({ error: 'Missing x-tenant-id header' });

    try {
      const body = generateSchema.parse(req.body);
      const result = await reportService.generateReport(
        tenantId,
        body.inspectionId,
        body.templateId,
        body.finalize,
        body.inspectionData
      );

      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.errors }});
      }
      handleError(res, err, req.params.requestId || 'unknown');
    }
  }

  async finalize(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { reportId } = req.params;

    try {
      const result = await reportService.finalizeReport(tenantId, reportId);
      res.json(result);
    } catch (err) {
      handleError(res, err, 'finalize');
    }
  }

  async getMetadata(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { reportId } = req.params;

    try {
      const result = await reportService.getReport(tenantId, reportId);
      res.json(result);
    } catch (err) {
      handleError(res, err, 'getMetadata');
    }
  }

  async download(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { reportId } = req.params;

    try {
      const url = await reportService.getDownloadUrl(tenantId, reportId);
      res.json({ url });
    } catch (err) {
      handleError(res, err, 'download');
    }
  }

  async list(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { inspectionId } = req.params;

    try {
      const reports = await reportService.listReports(tenantId, inspectionId);
      res.json({ reports });
    } catch (err) {
      handleError(res, err, 'list');
    }
  }
}

export const reportController = new ReportController();