import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../../config';
import { UserContext } from '../../types';
import { Buffer } from 'buffer';

declare global {
  namespace Express {
    interface Request {
      user: UserContext;
    }
  }
}

let JWKS: ReturnType<typeof createRemoteJWKSet>;

if (config.JWT_JWKS_URL) {
  JWKS = createRemoteJWKSet(new URL(config.JWT_JWKS_URL));
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Missing bearer token" } });
  }

  const token = authHeader.split(' ')[1];

  try {
    // If JWKS is not configured (local dev fallback if needed, or strictly fail)
    if (!JWKS) {
       console.warn("JWT_JWKS_URL not set, skipping signature verification (DEV ONLY)");
       // In production, this should likely fail or use a different dev flow
       // For now, attempting to decode without verify if generic dev setup, 
       // but typically we want to fail. 
       // fallback for mock tokens in dev if variables missing:
       if (process.env.NODE_ENV !== 'production' && token.startsWith('ey')) {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
          req.user = { userId: decoded.userId, tenantId: decoded.tenantId, role: decoded.role };
          return next();
       }
       throw new Error("JWKS not configured");
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
    });

    req.user = {
      userId: String(payload.sub),
      tenantId: String(payload.tenantId),
      role: payload.role ? String(payload.role) : undefined,
    };
    return next();
  } catch (error) {
    console.error("Auth failed:", error);
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid token" } });
  }
};

export const requireServiceAuth = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-service-auth'];
  if (!secret || secret !== config.SERVICE_AUTH_SECRET) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid service auth" } });
  }
  return next();
};