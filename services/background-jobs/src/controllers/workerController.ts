import { Request, Response } from 'express';
import { processJob } from '../worker/workerCore';
import { jobService } from '../services/jobService';

export const runWorker = async (req: Request, res: Response) => {
  try {
    // Cloud Tasks sends payload base64 encoded sometimes depending on lib, 
    // but express.json() usually handles standard JSON bodies.
    const { jobId, idempotencyKey } = req.body;

    if (!jobId || !idempotencyKey) {
      console.error('[Worker] Missing payload data');
      return res.status(400).send('Missing jobId or idempotencyKey');
    }

    console.log(`[Worker] Received task for job ${jobId}`);
    
    // Fire and forget logic? No, Cloud Tasks waits for 200 OK.
    // We must await processing.
    await processJob(jobId, idempotencyKey);

    res.status(200).send('OK');
  } catch (error) {
    console.error('[Worker] Error processing task', error);
    // Returning 500 tells Cloud Tasks to retry based on queue config.
    // However, our internal logic handles business-logic retries.
    // If we crash here, it's a system error, so 500 is appropriate for a quick retry.
    res.status(500).send('Internal Server Error');
  }
};

export const cronStuckJobs = async (req: Request, res: Response) => {
  try {
    const count = await jobService.reQueueStuckJobs();
    res.status(200).send(`Processed ${count} stuck jobs.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
};
