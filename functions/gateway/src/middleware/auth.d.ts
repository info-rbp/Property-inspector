import { FastifyRequest, FastifyReply } from 'fastify';
export interface AuthUser {
    userId: string;
    tenantId: string;
    email: string;
    role: 'ADMIN' | 'INSPECTOR' | 'VIEWER';
}
declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthUser;
        isServiceAuth?: boolean;
    }
}
export declare function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function requireRole(roles: AuthUser['role'][]): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
export declare function requireTenant(request: FastifyRequest, tenantId: string): boolean;
