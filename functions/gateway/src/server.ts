import { buildApp } from './app';
import { PrismaClient } from '@prisma/client';
import { config } from './config';

const prisma = new PrismaClient();

const app = buildApp({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.LOG_PRETTY && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    })
  }
});

export default app;
