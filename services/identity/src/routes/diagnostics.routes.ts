import { Router } from 'express';
import { getServiceName, getVersion, getCommitSha, getUptimeSeconds, getIsoTimeNow } from '../utils/runtime';
import { runReadinessChecks } from '../diagnostics/readiness';
import { requireServiceAuth } from '../middleware/auth.middleware';

const router = Router();

// Liveness Check
// GET /v1/health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: getServiceName(),
    version: getVersion(),
    time: getIsoTimeNow(),
    uptimeSeconds: getUptimeSeconds(),
    commitSha: getCommitSha()
  });
});

// Readiness Check
// GET /v1/ready
router.get('/ready', async (req, res) => {
  const result = await runReadinessChecks();
  
  // Return 503 if not ready to signal load balancers to stop sending traffic
  const statusCode = result.ready ? 200 : 503;
  
  res.status(statusCode).json(result);
});

// Service Auth Verification Endpoint
// GET /v1/echo-service-auth
router.get('/echo-service-auth', requireServiceAuth, (req, res) => {
  res.json({
    message: 'Service Authentication Successful',
    serviceAuthValid: true,
    timestamp: new Date().toISOString()
  });
});

export default router;