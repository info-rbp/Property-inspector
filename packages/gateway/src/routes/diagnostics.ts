import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { mediaService } from '../services/media';
import { billingService } from '../services/billing';
import { jobsService } from '../services/jobs';
import { auditService } from '../services/audit';
import { reportService } from '../services/report';
import { env } from '../config/env';

export async function diagnosticsRoutes(app: FastifyInstance) {
  
  // Liveness Probe
  app.get('/v1/health', async (req, reply) => {
    return {
      status: 'ok',
      service: 'inspection-gateway',
      version: '1.0.0', // In real app, from package.json
      environment: env.NODE_ENV,
      serverTime: new Date().toISOString()
    };
  });

  // Readiness Probe
  app.get('/v1/ready', async (req, reply) => {
    const checks = [];
    const start = performance.now();

    // 1. Database Check
    const dbStart = performance.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.push({ name: 'database', status: 'pass', latencyMs: Math.round(performance.now() - dbStart) });
    } catch (e) {
      checks.push({ name: 'database', status: 'fail', latencyMs: Math.round(performance.now() - dbStart), details: { error: 'DB_UNREACHABLE' } });
    }

    // 2. Downstream Services
    const [media, billing, jobs, audit, report] = await Promise.all([
      mediaService.healthCheck(),
      billingService.healthCheck(),
      jobsService.healthCheck(),
      auditService.healthCheck(),
      reportService.healthCheck()
    ]);

    checks.push({ name: 'service:media', status: media.status === 'ok' ? 'pass' : 'fail', latencyMs: media.latency });
    checks.push({ name: 'service:billing', status: billing.status === 'ok' ? 'pass' : 'fail', latencyMs: billing.latency });
    checks.push({ name: 'service:jobs', status: jobs.status === 'ok' ? 'pass' : 'fail', latencyMs: jobs.latency });
    checks.push({ name: 'service:audit', status: audit.status === 'ok' ? 'pass' : 'warn', latencyMs: audit.latency }); // Audit non-critical
    checks.push({ name: 'service:report', status: report.status === 'ok' ? 'pass' : 'fail', latencyMs: report.latency });

    // Aggregation Logic
    const criticalFailures = checks.filter(c => c.status === 'fail' && c.name !== 'service:audit').length;
    const warnings = checks.filter(c => c.status === 'warn' || (c.status === 'fail' && c.name === 'service:audit')).length;

    const status = criticalFailures > 0 ? 'not_ready' : (warnings > 0 ? 'degraded' : 'ready');

    if (status === 'not_ready') reply.status(503);

    return {
      status,
      service: 'inspection-gateway',
      checks,
      dependencies: { criticalFailures, warnings },
      latencyMs: Math.round(performance.now() - start)
    };
  });
}