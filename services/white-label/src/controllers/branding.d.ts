import { Request, Response, NextFunction } from 'express';
export declare const getBranding: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateBranding: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listTemplates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const selectTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
