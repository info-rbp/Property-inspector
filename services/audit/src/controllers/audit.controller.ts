
import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { AuditEventInputSchema } from '../models/audit-schema';
import { z } from 'zod';

export const createEvent = async (req: Request, res: Response) => {
  try {
    // Validate Input strictly against Zod Schema
    const validatedData = AuditEventInputSchema.parse(req.body);

    // Call Service
    const eventId = await AuditService.writeEvent(validatedData);

    res.status(201).json({ 
      success: true, 
      auditEventId: eventId,
      message: 'Event recorded immutably' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation Error', details: error.errors });
    } else {
      console.error('Write Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const getEntityHistory = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    // Tenant ID comes from Query for flexibility, but verified by middleware
    const tenantId = req.query.tenantId as string; 

    if (!tenantId) return res.status(400).json({ error: 'tenantId required' });

    const events = await AuditService.getEntityHistory(tenantId, entityType, entityId);
    res.json({ data: events });
  } catch (error) {
    console.error('Read Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInspectionSummary = async (req: Request, res: Response) => {
  try {
    const { inspectionId } = req.params;
    const tenantId = req.query.tenantId as string;

    if (!tenantId) return res.status(400).json({ error: 'tenantId required' });

    const summary = await AuditService.getInspectionSummary(tenantId, inspectionId);
    res.json({ data: summary });
  } catch (error) {
    console.error('Summary Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const exportAuditLog = async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string;
    const { startDate, endDate, format } = req.query;

    if (!tenantId) return res.status(400).json({ error: 'tenantId required' });

    const query = await AuditService.getExportQuery(tenantId, startDate as string, endDate as string);
    const snapshot = await query.get();

    const results = snapshot.docs.map(doc => doc.data());

    if (format === 'csv') {
      // Basic CSV flatten logic
      const csv = [
        ['Timestamp', 'Event', 'Actor', 'Entity', 'Hash'].join(','),
        ...results.map(r => [r.timestamp, r.eventType, r.actorId, r.entityId, r.payloadHash].join(','))
      ].join('\n');
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`audit_export_${tenantId}.csv`);
      return res.send(csv);
    }

    // Default JSON
    res.json({ data: results });
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
