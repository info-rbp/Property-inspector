import { config } from 'dotenv';
import { buildApp } from './app';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config();

const prisma = new PrismaClient();

const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Build Fastify app
    const app = await buildApp({ 
      logger: {
        level: process.env.LOG_LEVEL || 'info',
        ...(process.env.LOG_PRETTY === 'true' && {
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

    // Register shutdown hooks
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });

    // Start server
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`
🚀 Gateway Service Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server:      http://${host}:${port}
📚 API Docs:    http://${host}:${port}/docs
🏥 Health:      http://${host}:${port}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Start the server
start();