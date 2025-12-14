import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { verifyJwt, requireRole, UserContext } from '../middleware/auth';
import { billingService } from '../services/billing';
import { jobsService } from '../services/jobs';
import { JobType, JobStatus, InspectionStatus } from '@prisma/client';

export async function orchestrationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyJwt);
  app.addHook('preHandler', requireRole(['ADMIN', 'INSPECTOR']));

  // POST /v1/inspections/:id/analyze
  app.post('/v1/inspections/:id/analyze', async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = (req as any).user as UserContext;
    const { tenantId } = user;

    // 1. Validation
    const inspection = await prisma.inspection.findUnique({
      where: { id, tenantId }
    });
    
    if (!inspection) return reply.status(404).send({ error: 'Inspection not found' });
    if (inspection.status === InspectionStatus.FINALIZED) return reply.status(409).send({ error: 'Inspection is finalized' });

    // 2. Billing Check
    const entitlement = await billingService.checkEntitlement(tenantId, 'ai_analysis');
    if (entitlement && !entitlement.allowed) {
      return reply.status(403).send({ error: 'Billing Quota Exceeded' });
    }

    // 3. Idempotency Check (Is job already running?)
    const existingJob = await prisma.jobRef.findFirst({
      where: { inspectionId: id, type: JobType.ANALYZE_INSPECTION, status: { in: [JobStatus.PENDING, JobStatus.RUNNING] } }
    });
    if (existingJob) return reply.status(202).send({ jobId: existingJob.jobId, status: 'EXISTING_JOB' });

    // 4. Create Job
    const correlationId = `analysis-${id}-${Date.now()}`;
    const jobResult = await jobsService.createJob(tenantId, JobType.ANALYZE_INSPECTION, { inspectionId: id }, correlationId);

    if (!jobResult) return reply.status(502).send({ error: 'Failed to schedule job' });

    // 5. Store Ref
    await prisma.jobRef.create({
      data: {
        tenantId,
        inspectionId: id,
        jobId: jobResult.jobId,
        type: JobType.ANALYZE_INSPECTION,
        status: JobStatus.PENDING,
        correlationId
      }
    });

    // 6. Record Analysis Run Placeholder
    await prisma.analysisRun.create({
      data: {
        tenantId,
        inspectionId: id,
        jobId: jobResult.jobId,
        modelId: 'gemini-pro-vision',
        standardsVersion: 'v1.0',
        startedAt: new Date(),
        status: JobStatus.PENDING
      }
    });

    return reply.status(202).send({ jobId: jobResult.jobId, status: 'SCHEDULED' });
  });
}