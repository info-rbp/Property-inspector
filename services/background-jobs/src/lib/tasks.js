"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueWorkerTask = void 0;
const tasks_1 = require("@google-cloud/tasks");
const config_1 = require("../config");
const buffer_1 = require("buffer");
const tasksClient = new tasks_1.CloudTasksClient();
const enqueueWorkerTask = async (jobId, idempotencyKey, runAfter) => {
    const project = config_1.config.projectId;
    const queue = config_1.config.tasks.queue;
    const location = config_1.config.tasks.location;
    const url = `${config_1.config.tasks.workerUrl}/internal/worker/run`;
    const parent = tasksClient.queuePath(project, location, queue);
    const payload = {
        jobId,
        idempotencyKey,
    };
    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url,
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Auth': config_1.config.auth.serviceSecret, // Simple PSK for foundation
            },
            body: buffer_1.Buffer.from(JSON.stringify(payload)).toString('base64'),
        },
    };
    if (runAfter) {
        task.scheduleTime = {
            seconds: runAfter.seconds,
        };
    }
    console.log(`[Queue] Enqueuing task for job ${jobId} to ${url}`);
    try {
        const [response] = await tasksClient.createTask({ parent, task });
        return response.name;
    }
    catch (error) {
        console.error(`[Queue] Failed to enqueue task for job ${jobId}`, error);
        throw error;
    }
};
exports.enqueueWorkerTask = enqueueWorkerTask;
