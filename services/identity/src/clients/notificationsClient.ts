import { config } from '../config/env';
import { logger } from '../utils/logger';

interface NotificationPayload {
  tenantId: string;
  type: string;
  channel: 'email' | 'sms' | 'push';
  to: string;
  templateId: string;
  idempotencyKey?: string;
  variables: Record<string, any>;
}

export const notificationsClient = {
  send: async (payload: NotificationPayload) => {
    try {
      const response = await fetch(`${config.NOTIFICATIONS_SERVICE_URL}/v1/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Auth': config.SERVICE_AUTH_SECRET
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Notification Service Error: ${response.status} ${err}`);
      }

      logger.info(`[Notifications] Sent ${payload.type} to ${payload.to}`);
    } catch (error) {
      logger.error('[Notifications] Failed to send notification', error);
      // We log but do not rethrow to prevent blocking critical user flows (e.g. registration)
      // In a robust system, we might queue this for retry.
    }
  }
};