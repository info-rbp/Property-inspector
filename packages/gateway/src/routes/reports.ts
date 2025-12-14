import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';
import { config } from '../config';

const prisma = new PrismaClient();

export const reportRoutes: FastifyPluginAsync = async (app) => {
  // Generate report
  app.post('/generate', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { inspectionId } = request.body as { inspectionId: string };

    // Verify inspection
    const inspection = await prisma.inspection.findFirst({
      where: {
        id: inspectionId,
        tenantId: request.user.tenantId
      },
      include: {
        property: true,
        rooms: {
          include: {
            components: {
              include: {
                issues: {
                  where: {
                    OR: [
                      { source: 'HUMAN' },
                      { 
                        source: 'AI',
                        aiResolution: 'ACCEPTED'
                      }
                    ]
                  }
                },
                media: true
              }
            }
          }
        }
      }
    });

    if (!inspection) {
      throw new AppError(404, 'Inspection not found');
    }

    if (inspection.status === 'DRAFT') {
      throw new AppError(400, 'Cannot generate report for draft inspection');
    }

    // Create job for report generation
    const job = await prisma.job.create({
      data: {
        inspectionId,
        tenantId: request.user.tenantId,
        jobType: 'GENERATE_REPORT',
        status: 'PENDING',
        payload: {
          templateVersion: 'v1',
          jurisdiction: inspection.jurisdiction,
          inspectionType: inspection.inspectionType
        }
      }
    });

    // In production, send to Report Generation Service
    
    return {
      jobId: job.id,
      status: 'PENDING',
      message: 'Report generation started'
    };
  });

  // Get report status
  app.get('/status/:jobId', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { jobId } = request.params as { jobId: string };

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        tenantId: request.user.tenantId,
        jobType: 'GENERATE_REPORT'
      }
    });

    if (!job) {
      throw new AppError(404, 'Report job not found');
    }

    return {
      jobId: job.id,
      status: job.status,
      completedAt: job.completedAt,
      reportUrl: job.result?.reportUrl
    };
  });

  // Download report
  app.get('/download/:inspectionId', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { inspectionId } = request.params as { inspectionId: string };

    const inspection = await prisma.inspection.findFirst({
      where: {
        id: inspectionId,
        tenantId: request.user.tenantId
      }
    });

    if (!inspection) {
      throw new AppError(404, 'Inspection not found');
    }

    if (!inspection.reportPath) {
      throw new AppError(404, 'Report not yet generated');
    }

    // In production, get signed URL from Media Service
    const downloadUrl = `${config.MEDIA_SERVICE_URL}/download/${inspection.reportMediaId}`;

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tenantId: request.user.tenantId,
        userId: request.user.userId,
        inspectionId,
        action: 'VIEW',
        entityType: 'REPORT',
        entityId: inspectionId
      }
    });

    return {
      downloadUrl,
      expiresIn: 3600
    };
  });

  // Finalize report
  app.post('/finalize/:inspectionId', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { inspectionId } = request.params as { inspectionId: string };

    const inspection = await prisma.inspection.findFirst({
      where: {
        id: inspectionId,
        tenantId: request.user.tenantId
      }
    });

    if (!inspection) {
      throw new AppError(404, 'Inspection not found');
    }

    if (inspection.reportStatus === 'FINALIZED') {
      throw new AppError(400, 'Report already finalized');
    }

    if (!inspection.reportPath) {
      throw new AppError(400, 'No report to finalize');
    }

    // Update report status
    const updated = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        reportStatus: 'FINALIZED'
      }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tenantId: request.user.tenantId,
        userId: request.user.userId,
        inspectionId,
        action: 'FINALIZE',
        entityType: 'REPORT',
        entityId: inspectionId,
        metadata: {
          reportPath: inspection.reportPath
        }
      }
    });

    return updated;
  });
};