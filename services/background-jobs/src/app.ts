import express from 'express';
import cors from 'cors';
import { requireAuth, requireServiceAuth } from './middleware/auth';
import * as jobController from './controllers/jobController';
import * as workerController from './controllers/workerController';

const app = express();

app.use(express.json());
app.use(cors({ origin: true }));

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- Public API (Tenant Scoped) ---
const apiRouter = express.Router();
apiRouter.use(requireAuth);

apiRouter.post('/jobs', jobController.createJob);
apiRouter.get('/jobs/:jobId', jobController.getJob);
apiRouter.post('/jobs/:jobId/cancel', jobController.cancelJob);
apiRouter.get('/inspections/:inspectionId/jobs', jobController.listJobs);

app.use('/v1', apiRouter);

// --- Internal Worker API (Service Scoped) ---
const workerRouter = express.Router();
workerRouter.use(requireServiceAuth);

workerRouter.post('/worker/run', workerController.runWorker);
workerRouter.post('/maintenance/stuck-jobs', workerController.cronStuckJobs);

app.use('/internal', workerRouter);

export default app;
