import { Request, Response } from 'express';
export type ProcessResult = {
    thumbnailPath: string;
    width?: number;
    height?: number;
};
export declare const processMediaHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
