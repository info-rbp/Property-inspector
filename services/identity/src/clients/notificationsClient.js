"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.notificationsClient = {
    send: async (payload) => {
        try {
            const response = await fetch(`${env_1.config.NOTIFICATIONS_SERVICE_URL}/v1/notifications/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Auth': env_1.config.SERVICE_AUTH_SECRET
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Notification Service Error: ${response.status} ${err}`);
            }
            logger_1.logger.info(`[Notifications] Sent ${payload.type} to ${payload.to}`);
        }
        catch (error) {
            logger_1.logger.error('[Notifications] Failed to send notification', error);
            // We log but do not rethrow to prevent blocking critical user flows (e.g. registration)
            // In a robust system, we might queue this for retry.
        }
    }
};
