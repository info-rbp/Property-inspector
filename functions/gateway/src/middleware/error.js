"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const config_1 = require("../config");
class AppError extends Error {
    statusCode;
    message;
    code;
    details;
    constructor(statusCode, message, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(error, request, reply) {
    // Log error details
    request.log.error({
        err: error,
        request: {
            method: request.method,
            url: request.url,
            headers: request.headers,
            params: request.params,
            query: request.query
        }
    });
    // Handle AppError
    if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
            error: {
                message: error.message,
                code: error.code,
                details: error.details,
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId: request.id
            }
        });
    }
    // Handle Fastify validation errors
    if (error.validation) {
        return reply.code(400).send({
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: error.validation,
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId: request.id
            }
        });
    }
    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            return reply.code(409).send({
                error: {
                    message: 'Resource already exists',
                    code: 'DUPLICATE_RESOURCE',
                    details: {
                        field: prismaError.meta?.target
                    },
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    requestId: request.id
                }
            });
        }
        // Record not found
        if (prismaError.code === 'P2025') {
            return reply.code(404).send({
                error: {
                    message: 'Resource not found',
                    code: 'NOT_FOUND',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    requestId: request.id
                }
            });
        }
    }
    // Handle JWT errors
    if (error.message?.includes('jwt') || error.message?.includes('token')) {
        return reply.code(401).send({
            error: {
                message: 'Authentication failed',
                code: 'AUTH_ERROR',
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId: request.id
            }
        });
    }
    // Default error response
    const statusCode = error.statusCode || 500;
    const isDevelopment = config_1.config.NODE_ENV === 'development';
    return reply.code(statusCode).send({
        error: {
            message: isDevelopment ? error.message : 'Internal server error',
            code: 'INTERNAL_ERROR',
            ...(isDevelopment && {
                stack: error.stack,
                details: error
            }),
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.id
        }
    });
}
