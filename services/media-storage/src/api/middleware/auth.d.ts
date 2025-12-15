import { Request, Response, NextFunction } from 'express';
import { UserContext } from '../../types';
declare global {
    namespace Express {
        interface Request {
            user: UserContext;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireServiceAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
