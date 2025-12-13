import { Request, Response, NextFunction } from 'express';
import { verifyToken, AccessTokenPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid token'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    // TypeScript narrowing confirms payload is AccessTokenPayload here
    req.user = payload;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const requireServiceAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(new UnauthorizedError('API Key required'));
  }

  // Determine hash
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const keyRecord = await prisma.apiKey.findFirst({
    where: { keyHash, revokedAt: null }
  });

  if (!keyRecord) {
    return next(new UnauthorizedError('Invalid API Key'));
  }

  // Update last used (fire and forget)
  prisma.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  // For service auth, we might attach a dummy user or a specific service identity
  // For now, we allow pass-through. Specific scope checks would happen here.
  next();
};

export const requireTenantAccess = (targetTenantParam: string = 'tenantId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const requestedTenantId = req.params[targetTenantParam] || req.body[targetTenantParam];

    if (!user) {
      return next(new UnauthorizedError());
    }

    if (user.tenantId !== requestedTenantId) {
      // In a strict multi-tenant system, accessing another tenant's data is 404 or 403.
      // 404 is safer to avoid enumeration.
      return next(new ForbiddenError('Access to this tenant is denied'));
    }

    next();
  };
};

const ROLE_HIERARCHY: Record<string, number> = {
  VIEWER: 1,
  STAFF: 2,
  INSPECTOR: 3,
  ADMIN: 4,
  OWNER: 5,
};

export const requireRole = (minRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(new UnauthorizedError());

    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 99;

    if (userLevel < requiredLevel) {
      return next(new ForbiddenError(`Insufficient permissions. Required: ${minRole}`));
    }

    next();
  };
};