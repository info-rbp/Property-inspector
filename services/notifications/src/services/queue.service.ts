import { CloudTasksClient } from '@google-cloud/tasks';
import { config } from '../config';
import logger from '../utils/logger';
import axios from 'axios';
import { Buffer } from 'buffer';

const client = new CloudTasksClient();

export class QueueService {
  /**
   * Enqueues a task to process a notification.
   * Logic: If running locally (config.project === 'local'), it fires directly (async).
   * Otherwise, it creates a real Google Cloud Task.
   */
  async enqueueDelivery(notificationId: string, delaySeconds: number = 0): Promise<void> {
    const payload = { notificationId };

    if (config.cloudTasks.project === 'local') {
      logger.info('Running in LOCAL mode. Simulating Cloud Task...', { notificationId, delaySeconds });
      
      // In a real local dev env, you might use a timeout, but we will simply fire-and-forget
      // to the worker endpoint to verify the full HTTP loop if the server is running.
      // Alternatively, just log it.
      setTimeout(() => {
        this.localDispatch(payload).catch(err => logger.error("Local dispatch failed", err));
      }, delaySeconds * 1000);
      
      return;
    }

    const parent = client.queuePath(
      config.cloudTasks.project,
      config.cloudTasks.location,
      config.cloudTasks.queue
    );

    const url = config.cloudTasks.workerUrl;
    
    // Construct task
    const task: any = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        headers: {
          'Content-Type': 'application/json',
          // Secure the internal worker with the service secret
          'X-Service-Auth': config.security.serviceAuthSecret, 
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
      logger.info('Cloud Task created', { 
        name: response.name, 
        notificationId,
        scheduleDelay: delaySeconds 
      });
    } catch (error: any) {
      logger.error('Failed to create Cloud Task', { error: error.message, notificationId });
      throw error;
    }
  }

  private async localDispatch(payload: any) {
    try {
      await axios.post(config.cloudTasks.workerUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Auth': config.security.serviceAuthSecret
        }
      });
      logger.info('Local dispatch success');
    } catch (err: any) {
      logger.error('Local dispatch error', { msg: err.message });
    }
  }
}