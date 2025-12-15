import { Request, Response } from 'express';
export declare const sendNotification: (req: Request, res: Response) => Promise<void>;
export declare const previewNotification: (req: Request, res: Response) => Promise<void>;
export declare const getNotificationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const workerDeliver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
