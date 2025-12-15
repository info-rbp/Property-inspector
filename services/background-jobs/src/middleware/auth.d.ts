import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    headers: any;
    body: any;
    params: any;
    query: any;
    user?: {
        tenantId: string;
        userId: string;
    };
}
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireServiceAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
