import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import logger from './utils/logger';
import process from 'process';

const app = express();

app.use(express.json());
app.use(cors());

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Routes
app.use(routes);

const server = app.listen(config.port, () => {
  logger.info(`Notification Service running on port ${config.port}`);
  logger.info(`Environment: ${config.env}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});