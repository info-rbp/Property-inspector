import app from './app';
import { config } from './config';
import { startMediaProcessingSubscriber } from './subscribers/mediaProcessingSubscriber';

app.listen(config.port, () => {
  console.log(`Orchestrator running on port ${config.port}`);
  console.log(`Project: ${config.projectId}`);
  console.log(`Queue: ${config.tasks.queue}`);
  startMediaProcessingSubscriber().catch((error) => {
    console.error('[Startup] Failed to start media-processing subscriber', error);
  });
});
