"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAuditLog = exports.getInspectionSummary = exports.getEntityHistory = exports.createEvent = void 0;
const audit_service_1 = require("../services/audit.service");
const audit_schema_1 = require("../models/audit-schema");
const zod_1 = require("zod");
const createEvent = async (req, res) => {
    try {
        // Validate Input strictly against Zod Schema
        const validatedData = audit_schema_1.AuditEventInputSchema.parse(req.body);
        // Call Service
        const eventId = await audit_service_1.AuditService.writeEvent(validatedData);
        res.status(201).json({
            success: true,
            auditEventId: eventId,
            message: 'Event recorded immutably'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Validation Error', details: error.errors });
        }
        else {
            console.error('Write Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
exports.createEvent = createEvent;
const getEntityHistory = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        // Tenant ID comes from Query for flexibility, but verified by middleware
        const tenantId = req.query.tenantId;
        if (!tenantId)
            return res.status(400).json({ error: 'tenantId required' });
        const events = await audit_service_1.AuditService.getEntityHistory(tenantId, entityType, entityId);
        res.json({ data: events });
    }
    catch (error) {
        console.error('Read Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getEntityHistory = getEntityHistory;
const getInspectionSummary = async (req, res) => {
    try {
        const { inspectionId } = req.params;
        const tenantId = req.query.tenantId;
        if (!tenantId)
            return res.status(400).json({ error: 'tenantId required' });
        const summary = await audit_service_1.AuditService.getInspectionSummary(tenantId, inspectionId);
        res.json({ data: summary });
    }
    catch (error) {
        console.error('Summary Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getInspectionSummary = getInspectionSummary;
const exportAuditLog = async (req, res) => {
    try {
        const tenantId = req.query.tenantId;
        const { startDate, endDate, format } = req.query;
        if (!tenantId)
            return res.status(400).json({ error: 'tenantId required' });
        const query = await audit_service_1.AuditService.getExportQuery(tenantId, startDate, endDate);
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
    }
    catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.exportAuditLog = exportAuditLog;
