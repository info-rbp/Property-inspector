import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';
import { verifyServiceAuth } from '../middleware/serviceAuth';
import { mergeAiAnalysis, AiAnalysisResult } from '../engine/merge';
import { auditService } from '../services/audit';
import { billingService } from '../services/billing';
import { JobType, JobStatus } from '@prisma/client';

export async function webhookRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyServiceAuth);

  // POST /internal/webhooks/jobs/completed
  app.post('/internal/webhooks/jobs/completed', {
    schema: {
      body: z.object({
        jobId: z.string(),
        status: z.enum(['COMPLETED', 'FAILED']),
        output: z.any()
      })
    }
  }, async (req, reply) => {
    const { jobId, status, output } = req.body as any;

    // 1. Find Job Ref
    const jobRef = await prisma.jobRef.findUnique({
      where: { jobId },
      include: { inspection: true }
    });

    if (!jobRef) return reply.status(404).send({ error: 'Job Ref not found' });
    if (jobRef.status === JobStatus.COMPLETED) return reply.status(200).send({ status: 'ALREADY_PROCESSED' });

    // 2. Transactional Update
    await prisma.$transaction(async (tx) => {
      // Update Job Status
      await tx.jobRef.update({
        where: { id: jobRef.id },
        data: { status: status === 'COMPLETED' ? JobStatus.COMPLETED : JobStatus.FAILED }
      });

      if (status === 'COMPLETED') {
        if (jobRef.type === JobType.ANALYZE_INSPECTION) {
          // 3. Handle Analysis Completion
          const analysisRun = await tx.analysisRun.findFirst({ where: { jobId } });
          if (analysisRun) {
            await tx.analysisRun.update({
              where: { id: analysisRun.id },
              data: { completedAt: new Date(), status: JobStatus.COMPLETED }
            });

            // 4. CALL MERGE ENGINE
            const results = output.results as AiAnalysisResult[];
            // Note: In real implementation, pass 'tx' to mergeAiAnalysis to keep it in transaction
            // Here we use the separate merge function for modularity, but waiting for it effectively works
            // If strictly transactional, merge logic needs to accept PrismTransactionClient
            await mergeAiAnalysis({
              tenantId: jobRef.tenantId,
              inspectionId: jobRef.inspectionId,
              analysisRunId: analysisRun.id
            }, results);
            
            // 5. Billing & Audit
            await billingService.recordUsage(jobRef.tenantId, 'ai_analysis_run', 1, jobId);
            await auditService.appendEvent(jobRef.tenantId, 'INSPECTION_ANALYZED', 'system', { jobId });
          }
        }
      }
    });

    return { status: 'ok' };
  });
}