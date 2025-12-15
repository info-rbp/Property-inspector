import { Request, Response } from 'express';
export declare const getMedia: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getReadUrls: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listMedia: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleLegalHold: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
