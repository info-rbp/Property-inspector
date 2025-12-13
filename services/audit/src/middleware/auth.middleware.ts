
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: process.env.JWT_JWKS_URL || 'https://example.com/.well-known/jwks.json'
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err || !key) {
      callback(err, null);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// 1. Service-to-Service Auth (For Writes)
export const requireServiceAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // Expect format: "Bearer <SERVICE_SECRET>"
  // In production, use OIDC tokens from Cloud Run. Here we use a secret for simplicity.
  const token = authHeader?.split(' ')[1];

  if (!token || token !== process.env.SERVICE_AUTH_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid Service Credentials' });
  }
  next();
};

// 2. User/Tenant Auth (For Reads)
export const requireTenantAuth = (req: Request, res: Response, next: NextFunction) => {
  // If we are in dev mode and don't have a real JWKS url, skip (MOCK)
  if (process.env.NODE_ENV === 'development' && !process.env.JWT_JWKS_URL) {
    // Mock user for local dev
    (req as any).user = { sub: 'mock-user', tenantId: req.query.tenantId || 'tnt_dev' };
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid Token' });
    (req as any).user = decoded;
    next();
  });
};

// 3. Tenant Scope Check
export const enforceTenantScope = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const requestedTenantId = req.params.tenantId || req.query.tenantId || req.body.tenantId;

  // Platform admin bypass (check role in JWT)
  if (user.roles && user.roles.includes('platform_admin')) {
    return next();
  }

  if (!user.tenantId || user.tenantId !== requestedTenantId) {
    return res.status(403).json({ error: 'Forbidden: Tenant Mismatch' });
  }
  next();
};
