import { Request, Response, NextFunction } from 'express';
export declare const initiateUpload: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const completeUpload: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAssetUrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
