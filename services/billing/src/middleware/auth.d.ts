import { Request, Response, NextFunction } from 'express';
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
export declare const requireServiceAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireTenantAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAnyAuth: (req: Request, res: Response, next: NextFunction) => void;
