import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AuthRequest extends Request {
  // Explicitly define properties that might be missing if Request types resolve incorrectly
  headers: any;
  body: any;
  params: any;
  query: any;
  user?: {
    tenantId: string;
    userId: string;
  };
}

// Public API Auth (Placeholder for JWT/API Key validation)
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // NOTE: In production, integrate with your real Auth Provider (Auth0, Firebase Auth, etc.)
  // This is a stub to extract tenantId from headers for the demo foundation.
  
  let tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
     return res.status(401).json({ error: 'Unauthorized: Missing X-Tenant-ID header' });
  }

  req.user = {
    tenantId: tenantId,
    userId: (req.headers['x-user-id'] as string) || 'system',
  };

  next();
};

// Internal Service Auth (for Cloud Tasks -> Worker)
export const requireServiceAuth = (req: Request, res: Response, next: NextFunction) => {
  // Cast req to any to safely access headers if types are missing
  const secret = (req as any).headers['x-service-auth'];

  if (secret !== config.auth.serviceSecret) {
    console.warn(`[Auth] Invalid service secret from ip ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};