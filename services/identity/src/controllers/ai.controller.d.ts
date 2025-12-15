import { Request, Response, NextFunction } from 'express';
export declare const chat: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const fast: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const think: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
