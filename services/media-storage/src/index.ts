import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { mediaRoutes } from './api/routes';
import { processMediaHandler } from './worker/processor';
import { requireServiceAuth } from './api/middleware/auth';
import { db } from './storage/firestore';
import { bucket } from './storage/gcs';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Standard Health Check
app.get('/health', (_req, res) => {
  res.json({
    service: "media-storage",
    status: "ok",
    time: new Date().toISOString(),
  });
});

// Deep Ready Check (Dependencies)
app.get('/ready', async (_req, res) => {
  try {
    // Check Firestore
    await db.listCollections();
    // Check Storage
    const [exists] = await bucket.exists();
    if (!exists) throw new Error("Bucket access check failed");

    res.json({ ready: true });
  } catch (e: any) {
    res.status(503).json({ ready: false, error: String(e?.message ?? e) });
  }
});

// Worker Endpoint (Protected by Service Auth)
app.post('/events/process-media', requireServiceAuth, processMediaHandler);

// API Routes
app.use('/v1', mediaRoutes);

app.listen(config.PORT, () => {
  console.log(`Media Service running on port ${config.PORT}`);
  console.log(`Environment: ${config.GCLOUD_PROJECT}`);
});