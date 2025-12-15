import { Response } from 'express';
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare const handleError: (res: Response, error: unknown, requestId: string) => Response<any, Record<string, any>>;
