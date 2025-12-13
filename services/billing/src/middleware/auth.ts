
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        tenantId: string;
        role: string;
      };
      isService?: boolean;
    }
  }
}

// 1. Internal Service Authentication
// Used by Analysis App, Report App to record usage
export const requireServiceAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const serviceSecret = req.headers['x-service-secret'];

  // Check if using Service Secret strategy
  if (serviceSecret === config.SERVICE_AUTH_SECRET) {
    req.isService = true;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Missing or invalid Service Secret' });
};

// 2. Tenant/User Authentication (JWT)
// Used for Entitlement Checks and Admin/Dashboard Views
export const requireTenantAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    // Assuming JWT contains tenantId. Adjust based on Identity Service.
    // Example: { sub: 'user_123', tenantId: 'tnt_123', role: 'admin' }
    
    if (!decoded.tenantId) {
      return res.status(403).json({ error: 'Token missing tenantId' });
    }

    req.user = {
      tenantId: decoded.tenantId,
      role: decoded.role || 'user'
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Hybrid: Allows either Service Key OR Valid Tenant JWT
export const requireAnyAuth = (req: Request, res: Response, next: NextFunction) => {
    const serviceSecret = req.headers['x-service-secret'];
    if (serviceSecret === config.SERVICE_AUTH_SECRET) {
        req.isService = true;
        return next();
    }
    requireTenantAuth(req, res, next);
};
