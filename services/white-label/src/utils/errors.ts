import { Response } from 'express';

export class AppError extends Error {
    public statusCode: number;
    public code: string;

    constructor(statusCode: number, code: string, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const handleError = (err: unknown, res: Response) => {
    const requestId = res.locals.requestId || 'unknown';
    
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                requestId
            }
        });
    }

    console.error(`[${requestId}] Unexpected error:`, err);

    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.',
            requestId
        }
    });
};