import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Orchestrator running on port ${config.port}`);
  console.log(`Project: ${config.projectId}`);
  console.log(`Queue: ${config.tasks.queue}`);
});
