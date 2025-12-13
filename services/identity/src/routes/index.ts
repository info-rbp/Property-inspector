import { Router } from 'express';
import * as Auth from '../controllers/auth.controller';
import * as Tenant from '../controllers/tenant.controller';
import * as ApiKey from '../controllers/api-key.controller';
import wellKnownRoutes from './wellKnown.routes';
import diagnosticsRoutes from './diagnostics.routes';
import aiRoutes from './ai.routes';
import { requireAuth, requireTenantAccess, requireRole } from '../middleware/auth.middleware';

const router = Router();

// --- Diagnostics & Discovery ---
router.use('/.well-known', wellKnownRoutes);
router.use('/', diagnosticsRoutes); // Mounts /health and /ready

// --- AI Routes ---
router.use('/ai', aiRoutes);

// --- Auth Routes ---
router.post('/auth/register', Auth.register);
router.post('/auth/activate', Auth.activate);
router.post('/auth/login', Auth.login);
router.post('/auth/refresh', Auth.refresh);
router.post('/auth/logout', requireAuth, Auth.logout);
router.get('/auth/me', requireAuth, Auth.me);

// --- Tenant Routes ---
router.use('/tenants/:tenantId', requireAuth, requireTenantAccess('tenantId'));

router.get('/tenants/:tenantId', Tenant.getTenant);
router.patch('/tenants/:tenantId', requireRole('ADMIN'), Tenant.updateTenant);

router.get('/tenants/:tenantId/users', requireRole('ADMIN'), Tenant.getUsers);
router.post('/tenants/:tenantId/users/invite', requireRole('ADMIN'), Tenant.inviteUser);
router.patch('/tenants/:tenantId/users/:userId/role', requireRole('OWNER'), Tenant.updateUserRole);

// --- API Key Routes ---
router.post('/api-keys', requireAuth, requireRole('ADMIN'), ApiKey.createApiKey);
router.get('/api-keys', requireAuth, requireRole('ADMIN'), ApiKey.listApiKeys);
router.post('/api-keys/:id/revoke', requireAuth, requireRole('ADMIN'), ApiKey.revokeApiKey);

export default router;