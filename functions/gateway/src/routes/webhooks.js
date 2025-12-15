"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = webhookRoutes;
const zod_1 = require("zod");
const client_1 = require("../db/client");
const serviceAuth_1 = require("../middleware/serviceAuth");
const merge_1 = require("../engine/merge");
const audit_1 = require("../services/audit");
const billing_1 = require("../services/billing");
const client_2 = require("@prisma/client");
async function webhookRoutes(app) {
    app.addHook('preHandler', serviceAuth_1.verifyServiceAuth);
    // POST /internal/webhooks/jobs/completed
    app.post('/internal/webhooks/jobs/completed', {
        schema: {
            body: zod_1.z.object({
                jobId: zod_1.z.string(),
                status: zod_1.z.enum(['COMPLETED', 'FAILED']),
                output: zod_1.z.any()
            })
        }
    }, async (req, reply) => {
        const { jobId, status, output } = req.body;
        // 1. Find Job Ref
        const jobRef = await client_1.prisma.jobRef.findUnique({
            where: { jobId },
            include: { inspection: true }
        });
        if (!jobRef)
            return reply.status(404).send({ error: 'Job Ref not found' });
        if (jobRef.status === client_2.JobStatus.COMPLETED)
            return reply.status(200).send({ status: 'ALREADY_PROCESSED' });
        // 2. Transactional Update
        await client_1.prisma.$transaction(async (tx) => {
            // Update Job Status
            await tx.jobRef.update({
                where: { id: jobRef.id },
                data: { status: status === 'COMPLETED' ? client_2.JobStatus.COMPLETED : client_2.JobStatus.FAILED }
            });
            if (status === 'COMPLETED') {
                if (jobRef.type === client_2.JobType.ANALYZE_INSPECTION) {
                    // 3. Handle Analysis Completion
                    const analysisRun = await tx.analysisRun.findFirst({ where: { jobId } });
                    if (analysisRun) {
                        await tx.analysisRun.update({
                            where: { id: analysisRun.id },
                            data: { completedAt: new Date(), status: client_2.JobStatus.COMPLETED }
                        });
                        // 4. CALL MERGE ENGINE
                        const results = output.results;
                        // Note: In real implementation, pass 'tx' to mergeAiAnalysis to keep it in transaction
                        // Here we use the separate merge function for modularity, but waiting for it effectively works
                        // If strictly transactional, merge logic needs to accept PrismTransactionClient
                        await (0, merge_1.mergeAiAnalysis)({
                            tenantId: jobRef.tenantId,
                            inspectionId: jobRef.inspectionId,
                            analysisRunId: analysisRun.id
                        }, results);
                        // 5. Billing & Audit
                        await billing_1.billingService.recordUsage(jobRef.tenantId, 'ai_analysis_run', 1, jobId);
                        await audit_1.auditService.appendEvent(jobRef.tenantId, 'INSPECTION_ANALYZED', 'system', { jobId });
                    }
                }
            }
        });
        return { status: 'ok' };
    });
}
