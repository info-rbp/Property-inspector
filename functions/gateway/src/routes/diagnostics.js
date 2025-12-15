"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosticsRoutes = diagnosticsRoutes;
const client_1 = require("../db/client");
const media_1 = require("../services/media");
const billing_1 = require("../services/billing");
const jobs_1 = require("../services/jobs");
const audit_1 = require("../services/audit");
const report_1 = require("../services/report");
const env_1 = require("../config/env");
async function diagnosticsRoutes(app) {
    // Liveness Probe
    app.get('/v1/health', async (req, reply) => {
        return {
            status: 'ok',
            service: 'inspection-gateway',
            version: '1.0.0', // In real app, from package.json
            environment: env_1.env.NODE_ENV,
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
            await client_1.prisma.$queryRaw `SELECT 1`;
            checks.push({ name: 'database', status: 'pass', latencyMs: Math.round(performance.now() - dbStart) });
        }
        catch (e) {
            checks.push({ name: 'database', status: 'fail', latencyMs: Math.round(performance.now() - dbStart), details: { error: 'DB_UNREACHABLE' } });
        }
        // 2. Downstream Services
        const [media, billing, jobs, audit, report] = await Promise.all([
            media_1.mediaService.healthCheck(),
            billing_1.billingService.healthCheck(),
            jobs_1.jobsService.healthCheck(),
            audit_1.auditService.healthCheck(),
            report_1.reportService.healthCheck()
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
        if (status === 'not_ready')
            reply.status(503);
        return {
            status,
            service: 'inspection-gateway',
            checks,
            dependencies: { criticalFailures, warnings },
            latencyMs: Math.round(performance.now() - start)
        };
    });
}
