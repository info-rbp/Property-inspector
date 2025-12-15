import { Response } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, code: string, message: string);
}
export declare const handleError: (err: unknown, res: Response) => Response<any, Record<string, any>>;
