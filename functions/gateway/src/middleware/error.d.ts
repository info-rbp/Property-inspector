import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    code?: string | undefined;
    details?: any | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined, details?: any | undefined);
}
export declare function errorHandler(error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply): FastifyReply<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").RouteGenericInterface, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
