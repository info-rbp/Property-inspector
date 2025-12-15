import { Request, Response } from 'express';
export declare const createPolicy: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listPolicies: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const applyPolicy: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
