
import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/notification.service';
import logger from '../utils/logger';

const notificationService = new NotificationService();

const sendSchema = z.object({
  tenantId: z.string(),
  type: z.enum(['REPORT_READY', 'REPORT_SHARED', 'SUPPORT_NOTICE', 'PASSWORD_RESET', 'INVITE_USER', 'JOB_FAILED']),
  channel: z.enum(['email']),
  to: z.string().email(),
  templateId: z.string(),
  idempotencyKey: z.string(),
  correlationId: z.string().optional(),
  sourceService: z.string().optional(),
  triggeredBy: z.object({
    actorType: z.enum(['user', 'system']),
    actorId: z.string().optional()
  }),
  variables: z.record(z.any())
});

const previewSchema = z.object({
  tenantId: z.string(),
  templateId: z.string(),
  variables: z.record(z.any())
});

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const body = sendSchema.parse(req.body);
    
    // Auth Check: In production, verify X-Service-Auth matched expected secret for the specific caller
    // For now, middleware handles the general check.

    const result = await notificationService.enqueue(body);
    
    res.json({
      notificationId: result.notification_id,
      status: result.status
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    } else {
      logger.error('Send API Error', error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }
};

export const previewNotification = async (req: Request, res: Response) => {
  try {
    const body = previewSchema.parse(req.body);
    const result = await notificationService.preview(body);
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    } else {
      logger.error('Preview API Error', error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }
};

export const getNotificationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Assumption: Tenant ID comes from JWT middleware extracting claims
  // For this scaffold, we accept it as a header for testing simplicity
  const tenantId = req.headers['x-tenant-id'] as string; 

  if (!tenantId) {
    return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
  }

  try {
    const notification = await notificationService.getStatus(id, tenantId);
    if (!notification) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const workerDeliver = async (req: Request, res: Response) => {
  const { notificationId } = req.body;
  
  if (!notificationId) {
    return res.status(400).json({ error: 'Missing notificationId' });
  }

  logger.info(`Worker received task for ${notificationId}`);

  try {
    await notificationService.processDelivery(notificationId);
    res.status(200).send('OK');
  } catch (error: any) {
    logger.error('Worker Processing Error', error);
    // Return 200 to acknowledge receipt to Cloud Tasks so it doesn't auto-retry immediately, 
    // because we handled retries manually in service logic via re-enqueueing.
    // OR return 500 if we want Cloud Tasks to retry using its own backoff config.
    // Based on our code, we manually re-enqueued, so we return 200.
    res.status(200).send('Handled error manually');
  }
};
