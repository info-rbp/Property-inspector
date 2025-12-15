import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createJob: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getJob: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listJobs: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelJob: (req: AuthRequest, res: Response) => Promise<void>;
