import { Request, Response, NextFunction } from 'express';
export declare const createApiKey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listApiKeys: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const revokeApiKey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
