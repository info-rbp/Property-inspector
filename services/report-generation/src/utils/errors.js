"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const handleError = (res, error, requestId) => {
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
exports.handleError = handleError;
