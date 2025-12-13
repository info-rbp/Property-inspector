import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import router from './routes';
import { pdfService } from './services/pdf';

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // PDF payloads can be large

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/v1', router);

// Start Server
const startServer = async () => {
  try {
    // Pre-warm Playwright
    await pdfService.init();

    app.listen(config.port, () => {
      console.log(`Report Service running on port ${config.port}`);
      console.log(`Project: ${config.projectId}`);
      console.log(`Environment: ${config.isDev ? 'Development' : 'Production'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    (process as any).exit(1);
  }
};

// Graceful Shutdown
(process as any).on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing browser...');
  await pdfService.close();
  (process as any).exit(0);
});

startServer();