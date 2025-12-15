import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt';
declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireServiceAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireTenantAccess: (targetTenantParam?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (minRole: string) => (req: Request, res: Response, next: NextFunction) => void;
