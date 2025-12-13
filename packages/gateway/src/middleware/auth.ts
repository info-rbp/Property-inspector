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

const PUBLIC_ROUTES = [
  '/health',
  '/health/ready',
  '/health/version',
  '/docs',
  '/docs/json',
  '/docs/yaml',
  '/docs/static',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh'
];

const SERVICE_ROUTES = [
  '/api/v1/webhooks',
  '/api/v1/internal'
];

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const path = request.url.split('?')[0];

  // Skip auth for public routes
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return;
  }

  // Check for service-to-service authentication
  const serviceSecret = request.headers['x-service-secret'] as string;
  if (serviceSecret && SERVICE_ROUTES.some(route => path.startsWith(route))) {
    if (serviceSecret === process.env.SERVICE_SECRET) {
      request.isServiceAuth = true;
      return;
    }
    return reply.code(401).send({
      error: 'Invalid service credentials'
    });
  }

  // Check for JWT authentication
  try {
    // The JWT token should be in the Authorization header
    const authorization = request.headers.authorization;
    if (!authorization) {
      return reply.code(401).send({
        error: 'No authorization header'
      });
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) {
      return reply.code(401).send({
        error: 'Invalid authorization format'
      });
    }

    // Verify JWT token
    const decoded = await request.jwtVerify();
    
    // Extract user information from token
    request.user = {
      userId: decoded.sub as string,
      tenantId: decoded.tenantId as string,
      email: decoded.email as string,
      role: decoded.role as AuthUser['role']
    };

  } catch (error) {
    return reply.code(401).send({
      error: 'Invalid or expired token'
    });
  }
}

// Authorization helpers
export function requireRole(roles: AuthUser['role'][]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Authentication required'
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({
        error: 'Insufficient permissions'
      });
    }
  };
}

export function requireTenant(request: FastifyRequest, tenantId: string): boolean {
  if (request.isServiceAuth) return true;
  if (!request.user) return false;
  return request.user.tenantId === tenantId;
}