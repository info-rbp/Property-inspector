"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_1 = require("../db");
const queue_service_1 = require("./queue.service");
const smtp_provider_1 = require("./provider/smtp.provider");
const branding_service_1 = require("./branding.service");
const template_service_1 = require("./template.service");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
const queueService = new queue_service_1.QueueService();
const emailProvider = new smtp_provider_1.SmtpProvider(); // In a real app, use a factory
const brandingService = new branding_service_1.BrandingService();
const templateService = new template_service_1.TemplateService();
class NotificationService {
    /**
     * 1. Receive Request
     * 2. Insert into DB (Idempotent)
     * 3. Enqueue Task
     */
    async enqueue(params) {
        const client = await db_1.db.getClient();
        try {
            await client.query('BEGIN');
            // Check existence
            const existingRes = await client.query(`SELECT notification_id, status FROM notifications WHERE tenant_id = $1 AND idempotency_key = $2`, [params.tenantId, params.idempotencyKey]);
            if (existingRes.rows.length > 0) {
                await client.query('COMMIT');
                return existingRes.rows[0];
            }
            // Create new
            const insertRes = await client.query(`INSERT INTO notifications (
          tenant_id, channel, type, template_id, template_version,
          recipient_to, status, idempotency_key, correlation_id,
          source_service, triggered_by_actor_type, triggered_by_actor_id,
          payload_json
        ) VALUES (
          $1, $2, $3, $4, 1, -- Version resolved at send time usually, but for consistency lets start at 1
          $5, 'QUEUED', $6, $7,
          $8, $9, $10,
          $11
        ) RETURNING notification_id, status`, [
                params.tenantId,
                params.channel,
                params.type,
                params.templateId,
                params.to,
                params.idempotencyKey,
                params.correlationId,
                params.sourceService,
                params.triggeredBy.actorType,
                params.triggeredBy.actorId,
                JSON.stringify(params.variables)
            ]);
            const notification = insertRes.rows[0];
            await client.query('COMMIT');
            // Enqueue Cloud Task (outside of DB transaction to keep it fast)
            await queueService.enqueueDelivery(notification.notification_id);
            return notification;
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    /**
     * Preview a notification without sending it.
     */
    async preview(params) {
        // 1. Fetch Branding
        const brand = await brandingService.getBranding(params.tenantId);
        // 2. Prepare Variables (Merge payload with brand)
        const variables = {
            ...params.variables,
            tenantName: brand.name,
            brandColor: brand.primaryColor,
            logoUrl: brand.logoUrl,
            supportEmail: brand.supportEmail
        };
        // 3. Render Template
        return await templateService.render(params.templateId, variables);
    }
    /**
     * Worker Logic
     */
    async processDelivery(notificationId) {
        const res = await db_1.db.query(`SELECT * FROM notifications WHERE notification_id = $1`, [notificationId]);
        if (res.rows.length === 0)
            return; // Should not happen
        const notification = res.rows[0];
        // Terminal states check
        if (['SENT', 'CANCELLED', 'DEAD_LETTER'].includes(notification.status)) {
            logger_1.default.info('Notification already terminal', { id: notificationId, status: notification.status });
            return;
        }
        // Check attempts
        if (notification.attempts >= config_1.config.logic.maxAttempts) {
            await db_1.db.query(`UPDATE notifications SET status = 'DEAD_LETTER' WHERE notification_id = $1`, [notificationId]);
            logger_1.default.warn('Notification moved to DEAD_LETTER', { id: notificationId });
            return;
        }
        // Mark SENDING
        await db_1.db.query(`UPDATE notifications SET status = 'SENDING', attempts = attempts + 1, updated_at = NOW() WHERE notification_id = $1`, [notificationId]);
        const attemptStart = new Date();
        let attemptStatus = 'failure';
        let providerResp = null;
        let errorData = null;
        try {
            // 1. Fetch Branding
            const brand = await brandingService.getBranding(notification.tenant_id);
            // 2. Prepare Variables (Merge payload with brand)
            const variables = {
                ...notification.payload_json,
                tenantName: brand.name,
                brandColor: brand.primaryColor,
                logoUrl: brand.logoUrl,
                supportEmail: brand.supportEmail
            };
            // 3. Render Template
            const content = await templateService.render(notification.template_id, variables);
            // 4. Send Email
            const result = await emailProvider.sendEmail({
                to: notification.recipient_to,
                fromName: brand.name,
                replyTo: brand.supportEmail, // Or configured reply-to
                subject: content.subject,
                html: content.html
            });
            attemptStatus = 'success';
            providerResp = result;
            // 5. Update Notification Success
            await db_1.db.query(`UPDATE notifications 
         SET status = 'SENT', 
             sent_at = NOW(), 
             provider_message_id = $1,
             branding_version = $2,
             template_version = $3,
             content_hash = md5($4),
             from_name = $5,
             reply_to = $6
         WHERE notification_id = $7`, [
                result.providerMessageId,
                brand.version,
                content.templateVersion,
                content.subject + content.html,
                brand.name,
                brand.supportEmail,
                notificationId
            ]);
            logger_1.default.info('Notification delivered', { id: notificationId });
        }
        catch (err) {
            errorData = { message: err.message, stack: err.stack };
            attemptStatus = 'failure';
            // Calculate Backoff
            const nextAttempt = notification.attempts + 1; // Current attempt was just incremented in DB? No, we incremented before processing.
            // Wait. We incremented attempts at start of processing. So `notification.attempts` (from DB fetch) was old value.
            // The DB now has `attempts + 1`.
            // Let's rely on current count.
            const backoffSeconds = this.calculateBackoff(notification.attempts + 1); // simple exponential
            // Update DB to FAILED (temporary)
            await db_1.db.query(`UPDATE notifications SET status = 'FAILED', last_error = $1 WHERE notification_id = $2`, [JSON.stringify(errorData), notificationId]);
            // Re-enqueue if not maxed out
            if (notification.attempts + 1 < config_1.config.logic.maxAttempts) {
                logger_1.default.info(`Scheduling retry for ${notificationId} in ${backoffSeconds}s`);
                await queueService.enqueueDelivery(notificationId, backoffSeconds);
            }
            else {
                await db_1.db.query(`UPDATE notifications SET status = 'DEAD_LETTER' WHERE notification_id = $1`, [notificationId]);
            }
        }
        finally {
            // 6. Record Attempt
            await db_1.db.query(`INSERT INTO notification_attempts (notification_id, attempt_number, status, provider_response, error, started_at, finished_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [
                notificationId,
                notification.attempts + 1,
                attemptStatus,
                JSON.stringify(providerResp),
                JSON.stringify(errorData),
                attemptStart
            ]);
        }
    }
    calculateBackoff(attempt) {
        // 30s, 2m, 10m, 30m, 2h
        const schedule = [30, 120, 600, 1800, 7200];
        return schedule[attempt - 1] || 7200;
    }
    async getStatus(notificationId, tenantId) {
        const res = await db_1.db.query(`SELECT notification_id, status, created_at, sent_at, last_error FROM notifications WHERE notification_id = $1 AND tenant_id = $2`, [notificationId, tenantId]);
        return res.rows[0];
    }
}
exports.NotificationService = NotificationService;
