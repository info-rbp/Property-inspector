import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const mediaRoutes: FastifyPluginAsync = async (app) => {
  // Initiate media upload
  app.post('/initiate-upload', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { componentId, fileName, fileType, fileSize } = request.body as any;

    // Verify component belongs to user's tenant
    const component = await prisma.component.findFirst({
      where: {
        id: componentId,
        tenantId: request.user.tenantId
      }
    });

    if (!component) {
      throw new AppError(404, 'Component not found');
    }

    // Generate unique media ID
    const mediaId = `media_${crypto.randomBytes(16).toString('hex')}`;

    // In production, this would call the Media Storage Service
    // to get a signed upload URL from S3/GCS
    const uploadUrl = `${process.env.MEDIA_SERVICE_URL}/upload/${mediaId}`;

    // Create media reference in database
    const mediaRef = await prisma.mediaReference.create({
      data: {
        componentId,
        tenantId: request.user.tenantId,
        mediaId,
        mediaType: fileType.startsWith('video') ? 'VIDEO' : 'IMAGE',
        uploadUrl,
        metadata: {
          fileName,
          fileSize,
          mimeType: fileType
        }
      }
    });

    return {
      mediaId,
      uploadUrl,
      expiresIn: 3600 // URL expires in 1 hour
    };
  });

  // Confirm upload completion
  app.post('/complete-upload', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { mediaId } = request.body as { mediaId: string };

    const mediaRef = await prisma.mediaReference.findFirst({
      where: {
        mediaId,
        tenantId: request.user.tenantId
      }
    });

    if (!mediaRef) {
      throw new AppError(404, 'Media reference not found');
    }

    // In production, verify with Media Storage Service
    // that the file was actually uploaded
    
    // Update media reference
    const updated = await prisma.mediaReference.update({
      where: { id: mediaRef.id },
      data: {
        uploadedAt: new Date(),
        viewUrl: `${process.env.MEDIA_SERVICE_URL}/view/${mediaId}`,
        thumbnailUrl: `${process.env.MEDIA_SERVICE_URL}/thumb/${mediaId}`
      }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tenantId: request.user.tenantId,
        userId: request.user.userId,
        action: 'UPLOAD',
        entityType: 'MEDIA',
        entityId: mediaId,
        metadata: {
          componentId: mediaRef.componentId
        }
      }
    });

    return updated;
  });

  // Delete media
  app.delete('/:mediaId', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { mediaId } = request.params as { mediaId: string };

    const mediaRef = await prisma.mediaReference.findFirst({
      where: {
        mediaId,
        tenantId: request.user.tenantId
      }
    });

    if (!mediaRef) {
      throw new AppError(404, 'Media not found');
    }

    // In production, also delete from storage service
    
    await prisma.mediaReference.delete({
      where: { id: mediaRef.id }
    });

    return { success: true };
  });
};