import { Request, Response } from 'express';
export declare const initiateUpload: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const completeUpload: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
