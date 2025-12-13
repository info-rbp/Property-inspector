import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

interface AuditLogParams {
  tenantId?: string;
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: any;
}

export const logAudit = async (params: AuditLogParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorUserId: params.actorUserId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    // Non-blocking: just log the error if audit fails
    logger.error('Failed to write audit log', error);
  }
};