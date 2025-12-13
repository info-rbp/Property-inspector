import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { config } from '../config/env';
import { getJwks } from '../security/jwks';
import { withTimeout } from '../utils/withTimeout';
import { logger } from '../utils/logger';
import { getServiceName, getIsoTimeNow } from '../utils/runtime';

interface CheckResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

export interface ReadinessResult {
  ready: boolean;
  service: string;
  time: string;
  checks: {
    database: CheckResult;
    jwtKeys: CheckResult;
    jwks: CheckResult;
  };
}

/**
 * Measures the execution time of a check function.
 * Catches errors and ensures the result adheres to the CheckResult contract.
 */
const measure = async (fn: () => Promise<void>, timeoutMs = 2000): Promise<CheckResult> => {
  const start = performance.now();
  try {
    await withTimeout(fn(), timeoutMs, 'Check timed out');
    return { ok: true, latencyMs: Math.ceil(performance.now() - start) };
  } catch (error: any) {
    return {
      ok: false,
      latencyMs: Math.ceil(performance.now() - start),
      error: error.message || 'Unknown error'
    };
  }
};

export const runReadinessChecks = async (): Promise<ReadinessResult> => {
  const [db, jwtKeys, jwks] = await Promise.all([
    // Database Check
    measure(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (err) {
        // Sanitize error message
        throw new Error('DB unreachable');
      }
    }),
    
    // JWT Keys Check
    measure(async () => {
      if (!config.JWT_PRIVATE_KEY || !config.JWT_PUBLIC_KEY) {
        throw new Error('Missing key configuration');
      }
      try {
        // Validate Private Key
        crypto.createPrivateKey(config.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'));
        // Validate Public Key
        crypto.createPublicKey(config.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'));
      } catch (err) {
        throw new Error('Invalid key format');
      }
    }),

    // JWKS Check
    measure(async () => {
      try {
        const res = getJwks();
        if (!res.keys || res.keys.length === 0) throw new Error('No keys generated');
        const key = res.keys[0];
        if (!key.kid || !key.n || !key.e) throw new Error('Invalid JWK structure');
      } catch (err) {
        throw new Error('JWKS generation failed');
      }
    })
  ]);

  const ready = db.ok && jwtKeys.ok && jwks.ok;

  if (!ready) {
    logger.error('Readiness checks failed', { db, jwtKeys, jwks });
  }

  return {
    ready,
    service: getServiceName(),
    time: getIsoTimeNow(),
    checks: {
      database: db,
      jwtKeys,
      jwks
    }
  };
};
