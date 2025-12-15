"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const tasks_1 = require("@google-cloud/tasks");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const client = new tasks_1.CloudTasksClient();
class QueueService {
    /**
     * Enqueues a task to process a notification.
     * Logic: If running locally (config.project === 'local'), it fires directly (async).
     * Otherwise, it creates a real Google Cloud Task.
     */
    async enqueueDelivery(notificationId, delaySeconds = 0) {
        const payload = { notificationId };
        if (config_1.config.cloudTasks.project === 'local') {
            logger_1.default.info('Running in LOCAL mode. Simulating Cloud Task...', { notificationId, delaySeconds });
            // In a real local dev env, you might use a timeout, but we will simply fire-and-forget
            // to the worker endpoint to verify the full HTTP loop if the server is running.
            // Alternatively, just log it.
            setTimeout(() => {
                this.localDispatch(payload).catch(err => logger_1.default.error("Local dispatch failed", err));
            }, delaySeconds * 1000);
            return;
        }
        const parent = client.queuePath(config_1.config.cloudTasks.project, config_1.config.cloudTasks.location, config_1.config.cloudTasks.queue);
        const url = config_1.config.cloudTasks.workerUrl;
        // Construct task
        const task = {
            httpRequest: {
                httpMethod: 'POST',
                url,
                body: buffer_1.Buffer.from(JSON.stringify(payload)).toString('base64'),
                headers: {
                    'Content-Type': 'application/json',
                    // Secure the internal worker with the service secret
                    'X-Service-Auth': config_1.config.security.serviceAuthSecret,
                },
            },
        };
        if (delaySeconds > 0) {
            task.scheduleTime = {
                seconds: (Date.now() / 1000) + delaySeconds,
            };
        }
        try {
            const [response] = await client.createTask({ parent, task });
            logger_1.default.info('Cloud Task created', {
                name: response.name,
                notificationId,
                scheduleDelay: delaySeconds
            });
        }
        catch (error) {
            logger_1.default.error('Failed to create Cloud Task', { error: error.message, notificationId });
            throw error;
        }
    }
    async localDispatch(payload) {
        try {
            await axios_1.default.post(config_1.config.cloudTasks.workerUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Auth': config_1.config.security.serviceAuthSecret
                }
            });
            logger_1.default.info('Local dispatch success');
        }
        catch (err) {
            logger_1.default.error('Local dispatch error', { msg: err.message });
        }
    }
}
exports.QueueService = QueueService;
