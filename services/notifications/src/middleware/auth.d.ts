import { Request, Response, NextFunction } from 'express';
export declare const serviceAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const userAuth: (req: Request, res: Response, next: NextFunction) => void;
