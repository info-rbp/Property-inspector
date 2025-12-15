import { Request, Response } from 'express';
export declare const createEvent: (req: Request, res: Response) => Promise<void>;
export declare const getEntityHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInspectionSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const exportAuditLog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
