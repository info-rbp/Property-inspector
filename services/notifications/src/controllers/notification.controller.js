"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerDeliver = exports.getNotificationStatus = exports.previewNotification = exports.sendNotification = void 0;
const zod_1 = require("zod");
const notification_service_1 = require("../services/notification.service");
const logger_1 = __importDefault(require("../utils/logger"));
const notificationService = new notification_service_1.NotificationService();
const sendSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    type: zod_1.z.enum(['REPORT_READY', 'REPORT_SHARED', 'SUPPORT_NOTICE', 'PASSWORD_RESET', 'INVITE_USER', 'JOB_FAILED']),
    channel: zod_1.z.enum(['email']),
    to: zod_1.z.string().email(),
    templateId: zod_1.z.string(),
    idempotencyKey: zod_1.z.string(),
    correlationId: zod_1.z.string().optional(),
    sourceService: zod_1.z.string().optional(),
    triggeredBy: zod_1.z.object({
        actorType: zod_1.z.enum(['user', 'system']),
        actorId: zod_1.z.string().optional()
    }),
    variables: zod_1.z.record(zod_1.z.any())
});
const previewSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    templateId: zod_1.z.string(),
    variables: zod_1.z.record(zod_1.z.any())
});
const sendNotification = async (req, res) => {
    try {
        const body = sendSchema.parse(req.body);
        // Auth Check: In production, verify X-Service-Auth matched expected secret for the specific caller
        // For now, middleware handles the general check.
        const result = await notificationService.enqueue(body);
        res.json({
            notificationId: result.notification_id,
            status: result.status
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
        }
        else {
            logger_1.default.error('Send API Error', error);
            res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
};
exports.sendNotification = sendNotification;
const previewNotification = async (req, res) => {
    try {
        const body = previewSchema.parse(req.body);
        const result = await notificationService.preview(body);
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
        }
        else {
            logger_1.default.error('Preview API Error', error);
            res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
};
exports.previewNotification = previewNotification;
const getNotificationStatus = async (req, res) => {
    const { id } = req.params;
    // Assumption: Tenant ID comes from JWT middleware extracting claims
    // For this scaffold, we accept it as a header for testing simplicity
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
    }
    try {
        const notification = await notificationService.getStatus(id, tenantId);
        if (!notification) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(notification);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getNotificationStatus = getNotificationStatus;
const workerDeliver = async (req, res) => {
    const { notificationId } = req.body;
    if (!notificationId) {
        return res.status(400).json({ error: 'Missing notificationId' });
    }
    logger_1.default.info(`Worker received task for ${notificationId}`);
    try {
        await notificationService.processDelivery(notificationId);
        res.status(200).send('OK');
    }
    catch (error) {
        logger_1.default.error('Worker Processing Error', error);
        // Return 200 to acknowledge receipt to Cloud Tasks so it doesn't auto-retry immediately, 
        // because we handled retries manually in service logic via re-enqueueing.
        // OR return 500 if we want Cloud Tasks to retry using its own backoff config.
        // Based on our code, we manually re-enqueued, so we return 200.
        res.status(200).send('Handled error manually');
    }
};
exports.workerDeliver = workerDeliver;
