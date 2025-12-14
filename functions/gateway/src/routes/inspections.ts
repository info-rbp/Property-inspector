import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';
import { requireRole, requireTenant } from '../middleware/auth';

const prisma = new PrismaClient();

export const inspectionRoutes: FastifyPluginAsync = async (app) => {
  // List inspections for tenant
  app.get('/', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const inspections = await prisma.inspection.findMany({
      where: {
        tenantId: request.user.tenantId
      },
      include: {
        property: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return inspections;
  });

  // Get single inspection
  app.get('/:id', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = request.params as { id: string };

    const inspection = await prisma.inspection.findFirst({
      where: {
        id,
        tenantId: request.user.tenantId
      },
      include: {
        property: true,
        rooms: {
          include: {
            components: {
              include: {
                issues: true,
                media: true
              }
            }
          }
        },
        createdBy: true
      }
    });

    if (!inspection) {
      throw new AppError(404, 'Inspection not found');
    }

    return inspection;
  });

  // Create new inspection
  app.post('/', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const body = request.body as any;

    // Check if property exists or create new one
    let property = await prisma.property.findFirst({
      where: {
        tenantId: request.user.tenantId,
        street1: body.property.street1,
        city: body.property.city,
        state: body.property.state
      }
    });

    if (!property) {
      property = await prisma.property.create({
        data: {
          ...body.property,
          tenantId: request.user.tenantId
        }
      });
    }

    // Create inspection
    const inspection = await prisma.inspection.create({
      data: {
        tenantId: request.user.tenantId,
        propertyId: property.id,
        createdByUserId: request.user.userId,
        inspectionType: body.inspectionType || 'ROUTINE',
        status: 'DRAFT',
        jurisdiction: property.state,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        metadata: body.metadata || {}
      },
      include: {
        property: true
      }
    });

    // Create default rooms based on property type
    const defaultRooms = [
      { name: 'Living Room', roomType: 'LIVING' },
      { name: 'Kitchen', roomType: 'KITCHEN' },
      { name: 'Master Bedroom', roomType: 'BEDROOM' },
      { name: 'Bathroom', roomType: 'BATHROOM' },
      { name: 'Exterior', roomType: 'EXTERIOR' }
    ];

    for (const [index, room] of defaultRooms.entries()) {
      const createdRoom = await prisma.room.create({
        data: {
          inspectionId: inspection.id,
          tenantId: request.user.tenantId,
          name: room.name,
          roomType: room.roomType,
          sortOrder: index + 1
        }
      });

      // Create default components for each room
      const defaultComponents = [
        'Walls',
        'Ceiling',
        'Flooring',
        'Windows',
        'Doors',
        'Fixtures'
      ];

      for (const component of defaultComponents) {
        await prisma.component.create({
          data: {
            roomId: createdRoom.id,
            tenantId: request.user.tenantId,
            name: component
          }
        });
      }
    }

    reply.code(201);
    return inspection;
  });

  // Update inspection
  app.put('/:id', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = request.params as { id: string };
    const body = request.body as any;

    // Check if inspection exists and belongs to tenant
    const existing = await prisma.inspection.findFirst({
      where: {
        id,
        tenantId: request.user.tenantId
      }
    });

    if (!existing) {
      throw new AppError(404, 'Inspection not found');
    }

    if (existing.status === 'FINALIZED') {
      throw new AppError(400, 'Cannot modify finalized inspection');
    }

    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        status: body.status,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
        completedDate: body.completedDate ? new Date(body.completedDate) : undefined,
        metadata: body.metadata
      }
    });

    return updated;
  });

  // Finalize inspection
  app.post('/:id/finalize', async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = request.params as { id: string };

    const inspection = await prisma.inspection.findFirst({
      where: {
        id,
        tenantId: request.user.tenantId
      }
    });

    if (!inspection) {
      throw new AppError(404, 'Inspection not found');
    }

    if (inspection.status === 'FINALIZED') {
      throw new AppError(400, 'Inspection already finalized');
    }

    const finalized = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        finalizedDate: new Date()
      }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tenantId: request.user.tenantId,
        userId: request.user.userId,
        inspectionId: id,
        action: 'FINALIZE',
        entityType: 'INSPECTION',
        entityId: id,
        metadata: {
          previousStatus: inspection.status
        }
      }
    });

    return finalized;
  });
};