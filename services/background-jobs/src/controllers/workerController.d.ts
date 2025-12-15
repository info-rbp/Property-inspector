import { Request, Response } from 'express';
export declare const runWorker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cronStuckJobs: (req: Request, res: Response) => Promise<void>;
