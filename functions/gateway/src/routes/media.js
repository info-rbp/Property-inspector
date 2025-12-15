"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRoutes = void 0;
const client_1 = require("@prisma/client");
const error_1 = require("../middleware/error");
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const prisma = new client_1.PrismaClient();
const mediaRoutes = async (app) => {
    // Initiate media upload
    app.post('/initiate-upload', async (request, reply) => {
        if (!request.user) {
            throw new error_1.AppError(401, 'Authentication required');
        }
        const { componentId, fileName, fileType, fileSize } = request.body;
        // Verify component belongs to user's tenant
        const component = await prisma.component.findFirst({
            where: {
                id: componentId,
                tenantId: request.user.tenantId
            }
        });
        if (!component) {
            throw new error_1.AppError(404, 'Component not found');
        }
        // Generate unique media ID
        const mediaId = `media_${crypto_1.default.randomBytes(16).toString('hex')}`;
        // In production, this would call the Media Storage Service
        // to get a signed upload URL from S3/GCS
        const uploadUrl = `${config_1.config.MEDIA_SERVICE_URL}/upload/${mediaId}`;
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
            throw new error_1.AppError(401, 'Authentication required');
        }
        const { mediaId } = request.body;
        const mediaRef = await prisma.mediaReference.findFirst({
            where: {
                mediaId,
                tenantId: request.user.tenantId
            }
        });
        if (!mediaRef) {
            throw new error_1.AppError(404, 'Media reference not found');
        }
        // In production, verify with Media Storage Service
        // that the file was actually uploaded
        // Update media reference
        const updated = await prisma.mediaReference.update({
            where: { id: mediaRef.id },
            data: {
                uploadedAt: new Date(),
                viewUrl: `${config_1.config.MEDIA_SERVICE_URL}/view/${mediaId}`,
                thumbnailUrl: `${config_1.config.MEDIA_SERVICE_URL}/thumb/${mediaId}`
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
            throw new error_1.AppError(401, 'Authentication required');
        }
        const { mediaId } = request.params;
        const mediaRef = await prisma.mediaReference.findFirst({
            where: {
                mediaId,
                tenantId: request.user.tenantId
            }
        });
        if (!mediaRef) {
            throw new error_1.AppError(404, 'Media not found');
        }
        // In production, also delete from storage service
        await prisma.mediaReference.delete({
            where: { id: mediaRef.id }
        });
        return { success: true };
    });
};
exports.mediaRoutes = mediaRoutes;
