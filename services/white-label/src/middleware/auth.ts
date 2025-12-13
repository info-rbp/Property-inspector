import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
import { config } from '../config.js';
import { AuthUser } from '../types/index.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid token'));
    }

    const token = authHeader.split(' ')[1];

    try {
        // In a real scenario, use JWT_JWKS_URL and a library like jwks-rsa to verify signature from Auth0/Firebase/Cognito
        // Here we simulate simple verification or use a shared secret for simplicity
        
        let decoded: any;
        
        if (config.JWT_PUBLIC_KEY) {
             decoded = jwt.verify(token, config.JWT_PUBLIC_KEY);
        } else {
            // WARNING: For development only if no key provided. 
            // In production, this block should fail.
            decoded = jwt.decode(token);
        }

        if (!decoded || typeof decoded !== 'object') {
            throw new Error('Invalid token structure');
        }

        // Map claims to our internal user structure
        // Adjust these claim keys based on your Identity Provider
        const user: AuthUser = {
            userId: decoded.sub || decoded.uid,
            tenantId: decoded.tenantId || decoded.org_id, 
            role: decoded.role || 'viewer'
        };

        if (!user.tenantId && user.role !== 'platform_admin') {
             return next(new AppError(403, 'FORBIDDEN', 'Token missing tenant context'));
        }

        req.user = user;
        next();

    } catch (err) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
    }
};

export const requireRole = (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
};

export const ensureTenantAccess = (req: Request, res: Response, next: NextFunction) => {
    const { tenantId } = req.params;
    
    // Platform admin can access any tenant
    if (req.user?.role === 'platform_admin') {
        return next();
    }

    // Tenant users can only access their own tenant
    if (req.user?.tenantId === tenantId) {
        return next();
    }

    return next(new AppError(403, 'FORBIDDEN', 'Access to this tenant is denied'));
};