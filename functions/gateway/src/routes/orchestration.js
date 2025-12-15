"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrationRoutes = orchestrationRoutes;
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const billing_1 = require("../services/billing");
const jobs_1 = require("../services/jobs");
const client_2 = require("@prisma/client");
async function orchestrationRoutes(app) {
    app.addHook('preHandler', auth_1.verifyJwt);
    app.addHook('preHandler', (0, auth_1.requireRole)(['ADMIN', 'INSPECTOR']));
    // POST /v1/inspections/:id/analyze
    app.post('/v1/inspections/:id/analyze', async (req, reply) => {
        const { id } = req.params;
        const user = req.user;
        const { tenantId } = user;
        // 1. Validation
        const inspection = await client_1.prisma.inspection.findUnique({
            where: { id, tenantId }
        });
        if (!inspection)
            return reply.status(404).send({ error: 'Inspection not found' });
        if (inspection.status === client_2.InspectionStatus.FINALIZED)
            return reply.status(409).send({ error: 'Inspection is finalized' });
        // 2. Billing Check
        const entitlement = await billing_1.billingService.checkEntitlement(tenantId, 'ai_analysis');
        if (entitlement && !entitlement.allowed) {
            return reply.status(403).send({ error: 'Billing Quota Exceeded' });
        }
        // 3. Idempotency Check (Is job already running?)
        const existingJob = await client_1.prisma.jobRef.findFirst({
            where: { inspectionId: id, type: client_2.JobType.ANALYZE_INSPECTION, status: { in: [client_2.JobStatus.PENDING, client_2.JobStatus.RUNNING] } }
        });
        if (existingJob)
            return reply.status(202).send({ jobId: existingJob.jobId, status: 'EXISTING_JOB' });
        // 4. Create Job
        const correlationId = `analysis-${id}-${Date.now()}`;
        const jobResult = await jobs_1.jobsService.createJob(tenantId, client_2.JobType.ANALYZE_INSPECTION, { inspectionId: id }, correlationId);
        if (!jobResult)
            return reply.status(502).send({ error: 'Failed to schedule job' });
        // 5. Store Ref
        await client_1.prisma.jobRef.create({
            data: {
                tenantId,
                inspectionId: id,
                jobId: jobResult.jobId,
                type: client_2.JobType.ANALYZE_INSPECTION,
                status: client_2.JobStatus.PENDING,
                correlationId
            }
        });
        // 6. Record Analysis Run Placeholder
        await client_1.prisma.analysisRun.create({
            data: {
                tenantId,
                inspectionId: id,
                jobId: jobResult.jobId,
                modelId: 'gemini-pro-vision',
                standardsVersion: 'v1.0',
                startedAt: new Date(),
                status: client_2.JobStatus.PENDING
            }
        });
        return reply.status(202).send({ jobId: jobResult.jobId, status: 'SCHEDULED' });
    });
}
