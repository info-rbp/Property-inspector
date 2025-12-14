import Fastify, { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';

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
    origin: config.corsOrigins,
    credentials: true
  });

  await app.register(helmet, {
    contentSecurityPolicy: false // Configure based on your needs
  });

  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW
  });

  await app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN,
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE
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
          url: config.API_BASE_URL,
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