import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { signAccessToken, signRefreshToken, signActivationToken, hashToken, verifyToken } from '../utils/jwt';
import { config } from '../config/env';
import { logAudit } from '../services/audit.service';
import { getTenantEntitlements } from '../services/entitlement.service';
import { sendActivationEmail } from '../services/email.service';
import { PlanCode } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    tenantName: z.string().min(2),
  });

  try {
    const { email, password, fullName, tenantName } = schema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: tenantName }
      });

      // Stub subscription - Billing service will manage lifecycle later
      await tx.tenantSubscription.create({
        data: {
          tenantId: tenant.id,
          planId: 'basic-stub', 
          planCode: 'BASIC', 
          status: 'ACTIVE',
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          status: 'INVITED'
        }
      });

      await tx.membership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: 'OWNER'
        }
      });

      const activationToken = signActivationToken({ sub: user.id });
      return { tenant, user, activationToken };
    });

    // Non-blocking email send
    sendActivationEmail(result.user.email, result.activationToken, result.tenant.id).catch(console.error);

    await logAudit({
      tenantId: result.tenant.id,
      actorUserId: result.user.id,
      action: 'TENANT_REGISTERED',
      targetType: 'TENANT',
      targetId: result.tenant.id
    });

    res.status(201).json({
      message: "Registration successful. Please check your email.",
      tenantId: result.tenant.id,
      userId: result.user.id,
      // EXPOSED FOR DIAGNOSTIC HARNESS:
      activationToken: result.activationToken 
    });
  } catch (error) {
    next(error);
  }
};

export const activate = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ token: z.string() });

  try {
    const { token } = schema.parse(req.body);

    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      throw new BadRequestError('Invalid or expired activation token');
    }

    if (payload.type !== 'activation') throw new BadRequestError('Invalid token type');

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { memberships: { include: { tenant: true } } }
    });

    if (!user) throw new BadRequestError('User not found');
    if (user.status === 'ACTIVE') return res.json({ message: 'Account already active' });

    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' }
    });

    // Auto-login
    if (user.memberships.length === 0) throw new UnauthorizedError('No tenant membership found');
    const membership = user.memberships[0];
    const tenantId = membership.tenantId;

    const entitlements = await getTenantEntitlements(tenantId);

    const accessToken = signAccessToken({
      sub: user.id,
      tenantId: tenantId,
      role: membership.role,
      plan: entitlements.plan,
      features: entitlements.features
    });

    const refreshTokenString = signRefreshToken({ sub: user.id, tenantId });
    
    // Initial Refresh Token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tenantId,
        tokenHash: hashToken(refreshTokenString),
        familyId: uuidv4(), // Start a new token family
        expiresAt: new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      message: 'Account activated successfully',
      accessToken,
      refreshToken: refreshTokenString,
      tenantId,
      role: membership.role
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
    tenantId: z.string().optional(),
  });

  try {
    const { email, password, tenantId } = schema.parse(req.body);

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { memberships: { include: { tenant: true } } }
    });

    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedError('Invalid credentials');

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedError('Invalid credentials');

    let targetTenantId = tenantId;
    let role = '';

    if (!targetTenantId) {
      if (user.memberships.length === 0) throw new UnauthorizedError('No active memberships');
      targetTenantId = user.memberships[0].tenantId;
      role = user.memberships[0].role;
    } else {
      const membership = user.memberships.find(m => m.tenantId === targetTenantId);
      if (!membership) throw new UnauthorizedError('Not a member of this tenant');
      role = membership.role;
    }

    const entitlements = await getTenantEntitlements(targetTenantId);

    const accessToken = signAccessToken({
      sub: user.id,
      tenantId: targetTenantId,
      role,
      plan: entitlements.plan,
      features: entitlements.features
    });

    const refreshTokenString = signRefreshToken({ sub: user.id, tenantId: targetTenantId });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tenantId: targetTenantId,
        tokenHash: hashToken(refreshTokenString),
        familyId: uuidv4(), // New login = New Family
        expiresAt: new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      accessToken,
      refreshToken: refreshTokenString,
      tenantId: targetTenantId,
      role,
      plan: entitlements.plan
    });

  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ refreshToken: z.string() });

  try {
    const { refreshToken } = schema.parse(req.body);
    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch (e) {
      throw new UnauthorizedError('Invalid token format');
    }

    if (payload.type !== 'refresh') throw new UnauthorizedError('Invalid token type');

    const incomingTokenHash = hashToken(refreshToken);

    // 1. Find token
    const storedToken = await prisma.refreshToken.findFirst({
      where: { tokenHash: incomingTokenHash }
    });

    // 2. Token Reuse Detection (Theft Scenario)
    if (storedToken && storedToken.revokedAt) {
      // Alert: A revoked token is being used. Revoke the entire family.
      await prisma.refreshToken.updateMany({
        where: { familyId: storedToken.familyId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
      await logAudit({
        tenantId: payload.tenantId,
        actorUserId: payload.sub,
        action: 'TOKEN_THEFT_DETECTED',
        targetType: 'USER',
        targetId: payload.sub,
        metadata: { familyId: storedToken.familyId }
      });
      throw new UnauthorizedError('Invalid refresh token (reuse detected)');
    }

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // 3. Verify User & Tenant
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    const membership = await prisma.membership.findUnique({
      where: { tenantId_userId: { tenantId: payload.tenantId, userId: payload.sub } }
    });

    if (!user || !membership) throw new UnauthorizedError('User access invalid');

    // 4. Rotate
    const entitlements = await getTenantEntitlements(payload.tenantId);
    
    const newAccessToken = signAccessToken({
      sub: user.id,
      tenantId: payload.tenantId,
      role: membership.role,
      plan: entitlements.plan,
      features: entitlements.features
    });

    const newRefreshTokenString = signRefreshToken({ sub: user.id, tenantId: payload.tenantId });

    // Transaction: Revoke Old, Create New, Link them
    await prisma.$transaction(async (tx) => {
      // Create new token inheriting familyId
      const newTokenRecord = await tx.refreshToken.create({
        data: {
          userId: user.id,
          tenantId: payload.tenantId,
          tokenHash: hashToken(newRefreshTokenString),
          familyId: storedToken.familyId,
          expiresAt: new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
        }
      });

      // Revoke old token and point to new one
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { 
          revokedAt: new Date(),
          replacedByTokenId: newTokenRecord.id
        }
      });
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshTokenString });

  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
     const userId = req.user?.sub;
     // If we have the refresh token in body, revoke just that family, otherwise revoke all for user
     // For safety in this prompt, revoke all active tokens for this user on this device/tenant context
     if (userId) {
       await prisma.refreshToken.updateMany({
         where: { userId, revokedAt: null },
         data: { revokedAt: new Date() }
       });
     }
     res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const tenantId = req.user!.tenantId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, status: true }
    });

    const membership = await prisma.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
      include: { tenant: { select: { id: true, name: true, status: true } } }
    });

    const entitlements = await getTenantEntitlements(tenantId);

    res.json({
      user,
      tenant: membership?.tenant,
      role: membership?.role,
      entitlements
    });
  } catch (error) {
    next(error);
  }
};