import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

export const analysisRoutes: FastifyPluginAsync = async (app) => {
  // Start analysis job
  app.post('/start', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { inspectionId, analysisType = 'STANDARD' } = request.body as any;

    // Verify inspection belongs to tenant
    const inspection = await prisma.inspection.findFirst({
      where: {
        id: inspectionId,
        tenantId: request.user.tenantId
      },
      include: {
        rooms: {
          include: {
            components: {
              include: {
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

    if (inspection.status === 'FINALIZED') {
      throw new AppError(400, 'Cannot analyze finalized inspection');
    }

    // Check if there are photos to analyze
    const totalPhotos = inspection.rooms.reduce(
      (sum, room) => sum + room.components.reduce(
        (compSum, comp) => compSum + comp.media.length, 0
      ), 0
    );

    if (totalPhotos === 0) {
      throw new AppError(400, 'No photos to analyze');
    }

    // In production, check billing/quota here

    // Create job
    const job = await prisma.job.create({
      data: {
        inspectionId,
        tenantId: request.user.tenantId,
        jobType: analysisType === 'DEEP' ? 'DEEP_ANALYSIS' : 'ANALYZE_INSPECTION',
        status: 'PENDING',
        payload: {
          analysisType,
          totalPhotos
        }
      }
    });

    // In production, send to Background Jobs Service for processing
    // For now, we'll simulate the job starting
    setTimeout(async () => {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date()
        }
      });
    }, 1000);

    return {
      jobId: job.id,
      status: 'PENDING',
      message: 'Analysis job created'
    };
  });

  // Get job status
  app.get('/job/:jobId', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { jobId } = request.params as { jobId: string };

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        tenantId: request.user.tenantId
      }
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    return job;
  });

  // Webhook endpoint for job completion (called by Jobs Service)
  app.post('/webhook/complete', async (request, reply) => {
    // Verify service secret
    const serviceSecret = request.headers['x-service-secret'];
    if (serviceSecret !== process.env.SERVICE_SECRET) {
      throw new AppError(401, 'Invalid service credentials');
    }

    const { jobId, results } = request.body as any;

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    // Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        result: results
      }
    });

    // Process AI results and create issues
    if (results?.components) {
      for (const componentResult of results.components) {
        // Clear previous AI issues
        await prisma.issue.deleteMany({
          where: {
            componentId: componentResult.componentId,
            source: 'AI'
          }
        });

        // Create new AI issues
        for (const issue of componentResult.issues || []) {
          await prisma.issue.create({
            data: {
              componentId: componentResult.componentId,
              tenantId: job.tenantId,
              issueType: issue.type,
              severity: issue.severity,
              confidence: issue.confidence,
              notes: issue.notes,
              source: 'AI',
              metadata: issue.metadata || {}
            }
          });
        }

        // Update component with AI suggestions if provided
        if (componentResult.suggestedComment) {
          await prisma.component.update({
            where: { id: componentResult.componentId },
            data: {
              aiAnalyzedAt: new Date(),
              metadata: {
                aiSuggestedComment: componentResult.suggestedComment
              }
            }
          });
        }
      }
    }

    // Update inspection analysis version
    await prisma.inspection.update({
      where: { id: job.inspectionId },
      data: {
        analysisVersion: {
          increment: 1
        }
      }
    });

    return { success: true };
  });
};