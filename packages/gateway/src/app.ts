import Fastify, { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// Import route handlers
import { healthRoutes } from './routes/health';
import { inspectionRoutes } from './routes/inspections';
import { mediaRoutes } from './routes/media';
import { analysisRoutes } from './routes/analysis';
import { reportRoutes } from './routes/reports';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  // Register core plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  });

  await app.register(helmet, {
    contentSecurityPolicy: false // Configure based on your needs
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute'
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'proinspect-gateway',
      audience: process.env.JWT_AUDIENCE || 'proinspect-platform'
    }
  });

  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB max file size
    }
  });

  // API Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'ProInspect Gateway API',
        description: 'Core API for property inspection platform',
        version: '1.0.0'
      },
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:3001',
          description: 'Gateway API Server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          serviceAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Service-Secret'
          }
        }
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    transformStaticCSP: (header) => header,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });

  // Register middleware
  app.setErrorHandler(errorHandler);
  app.addHook('onRequest', authMiddleware);

  // Register routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(inspectionRoutes, { prefix: '/api/v1/inspections' });
  await app.register(mediaRoutes, { prefix: '/api/v1/media' });
  await app.register(analysisRoutes, { prefix: '/api/v1/analysis' });
  await app.register(reportRoutes, { prefix: '/api/v1/reports' });

  return app;
}