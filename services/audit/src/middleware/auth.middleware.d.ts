import { Request, Response, NextFunction } from 'express';
export declare const requireServiceAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireTenantAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const enforceTenantScope: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
