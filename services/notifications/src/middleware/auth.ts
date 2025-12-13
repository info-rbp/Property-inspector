
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const serviceAuth = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-service-auth'];
  if (secret !== config.security.serviceAuthSecret) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid Service Secret' } });
  }
  next();
};

// Placeholder for JWT verification
export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  // Implement JWT verification using config.security.jwtJwksUrl
  // Verify tenantId claim matches request scope
  next();
};
