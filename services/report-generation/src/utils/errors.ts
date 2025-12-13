import { Response } from 'express';
import { ServiceError } from '../types';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleError = (res: Response, error: unknown, requestId: string) => {
  console.error(`[Request ${requestId}] Error:`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        requestId,
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  });
};
