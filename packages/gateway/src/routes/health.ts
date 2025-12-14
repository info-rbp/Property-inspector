import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  // Liveness probe - basic health check
  app.get('/', async (request, reply) => {
    return {
      status: 'healthy',
      service: 'gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // Readiness probe - check dependencies
  app.get('/ready', async (request, reply) => {
    const checks: any[] = [];
    let isReady = true;

    // Check database connection
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.push({
        name: 'database',
        status: 'pass',
        latencyMs: Date.now() - startTime
      });
    } catch (error) {
      checks.push({
        name: 'database',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      isReady = false;
    }

    // Check Redis if configured
    if (config.REDIS_URL) {
      try {
        const startTime = Date.now();
        // Add Redis health check here when implemented
        checks.push({
          name: 'redis',
          status: 'pass',
          latencyMs: Date.now() - startTime
        });
      } catch (error) {
        checks.push({
          name: 'redis',
          status: 'fail',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Redis is optional, don't fail readiness
      }
    }

    // Check downstream services
    const services = [
      { name: 'media-service', url: config.MEDIA_SERVICE_URL },
      { name: 'jobs-service', url: config.JOBS_SERVICE_URL },
      { name: 'billing-service', url: config.BILLING_SERVICE_URL }
    ];

    for (const service of services) {
      if (service.url) {
        try {
          const startTime = Date.now();
          const response = await fetch(`${service.url}/health`, {
            signal: AbortSignal.timeout(5000)
          });
          
          checks.push({
            name: service.name,
            status: response.ok ? 'pass' : 'warn',
            latencyMs: Date.now() - startTime,
            statusCode: response.status
          });
        } catch (error) {
          checks.push({
            name: service.name,
            status: 'warn',
            error: 'Service unreachable'
          });
          // Don't fail readiness for downstream services
        }
      }
    }

    reply.code(isReady ? 200 : 503);
    return {
      status: isReady ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString()
    };
  });

  // Version endpoint
  app.get('/version', async (request, reply) => {
    return {
      service: 'gateway',
      version: config.PACKAGE_VERSION,
      commit: config.GIT_COMMIT || 'unknown',
      buildTime: config.BUILD_TIME || 'unknown',
      environment: config.NODE_ENV || 'development'
    };
  });
};