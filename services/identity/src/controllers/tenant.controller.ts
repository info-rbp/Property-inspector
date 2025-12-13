import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { logAudit } from '../services/audit.service';

export const getTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.tenantId }
    });
    if (!tenant) throw new NotFoundError('Tenant not found');
    res.json(tenant);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ name: z.string().min(2) });
  try {
    const { name } = schema.parse(req.body);
    const tenant = await prisma.tenant.update({
      where: { id: req.params.tenantId },
      data: { name }
    });

    await logAudit({
      tenantId: tenant.id,
      actorUserId: req.user?.sub,
      action: 'UPDATE_TENANT',
      targetType: 'TENANT',
      targetId: tenant.id
    });

    res.json(tenant);
  } catch (error) {
    next(error);
  }
};

export const inviteUser = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'INSPECTOR', 'STAFF', 'VIEWER'])
  });

  try {
    const { email, role } = schema.parse(req.body);
    const tenantId = req.params.tenantId;

    let user = await prisma.user.findUnique({ where: { email } });

    // Transaction to ensure idempotency
    await prisma.$transaction(async (tx) => {
      if (!user) {
        // Create user placeholder if not exists
        user = await tx.user.create({
          data: {
            email,
            fullName: 'Invited User', // Placeholder
            passwordHash: 'placeholder', // Cannot login until claimed
            status: 'INVITED'
          }
        });
      }

      const existingMembership = await tx.membership.findUnique({
        where: { tenantId_userId: { tenantId, userId: user!.id } }
      });

      if (existingMembership) {
        throw new Error('User is already a member of this tenant');
      }

      await tx.membership.create({
        data: {
          tenantId,
          userId: user!.id,
          role
        }
      });
    });

    // In a real app, send email with invite link here.
    // Return a dummy invite token/status
    res.json({ message: 'User invited', userId: user!.id, status: 'INVITED' });

    await logAudit({
      tenantId,
      actorUserId: req.user?.sub,
      action: 'INVITE_USER',
      targetType: 'USER',
      targetId: user!.id,
      metadata: { role }
    });

  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.membership.findMany({
      where: { tenantId: req.params.tenantId },
      include: { user: { select: { id: true, email: true, fullName: true, status: true, lastLoginAt: true } } }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ role: z.enum(['ADMIN', 'INSPECTOR', 'STAFF', 'VIEWER']) });
  try {
    const { role } = schema.parse(req.body);
    const { tenantId, userId } = req.params;

    const membership = await prisma.membership.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { role }
    });

    res.json(membership);
    
    await logAudit({
      tenantId,
      actorUserId: req.user?.sub,
      action: 'UPDATE_ROLE',
      targetType: 'USER',
      targetId: userId,
      metadata: { newRole: role }
    });

  } catch (error) {
    next(error);
  }
};