import { CloudTasksClient } from '@google-cloud/tasks';
import { config } from '../config';
import { Timestamp } from '@google-cloud/firestore';
import { Buffer } from 'buffer';

const tasksClient = new CloudTasksClient();

export const enqueueWorkerTask = async (
  jobId: string,
  idempotencyKey: string,
  runAfter?: Timestamp
) => {
  const project = config.projectId;
  const queue = config.tasks.queue;
  const location = config.tasks.location;
  const url = `${config.tasks.workerUrl}/internal/worker/run`;
  
  const parent = tasksClient.queuePath(project, location, queue);

  const payload = {
    jobId,
    idempotencyKey,
  };

  const task: any = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Auth': config.auth.serviceSecret, // Simple PSK for foundation
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
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
  } catch (error) {
    console.error(`[Queue] Failed to enqueue task for job ${jobId}`, error);
    throw error;
  }
};