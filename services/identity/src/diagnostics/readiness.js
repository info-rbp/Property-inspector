"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReadinessChecks = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../utils/prisma");
const env_1 = require("../config/env");
const jwks_1 = require("../security/jwks");
const withTimeout_1 = require("../utils/withTimeout");
const logger_1 = require("../utils/logger");
const runtime_1 = require("../utils/runtime");
/**
 * Measures the execution time of a check function.
 * Catches errors and ensures the result adheres to the CheckResult contract.
 */
const measure = async (fn, timeoutMs = 2000) => {
    const start = performance.now();
    try {
        await (0, withTimeout_1.withTimeout)(fn(), timeoutMs, 'Check timed out');
        return { ok: true, latencyMs: Math.ceil(performance.now() - start) };
    }
    catch (error) {
        return {
            ok: false,
            latencyMs: Math.ceil(performance.now() - start),
            error: error.message || 'Unknown error'
        };
    }
};
const runReadinessChecks = async () => {
    const [db, jwtKeys, jwks] = await Promise.all([
        // Database Check
        measure(async () => {
            try {
                await prisma_1.prisma.$queryRaw `SELECT 1`;
            }
            catch (err) {
                // Sanitize error message
                throw new Error('DB unreachable');
            }
        }),
        // JWT Keys Check
        measure(async () => {
            if (!env_1.config.JWT_PRIVATE_KEY || !env_1.config.JWT_PUBLIC_KEY) {
                throw new Error('Missing key configuration');
            }
            try {
                // Validate Private Key
                crypto_1.default.createPrivateKey(env_1.config.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'));
                // Validate Public Key
                crypto_1.default.createPublicKey(env_1.config.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'));
            }
            catch (err) {
                throw new Error('Invalid key format');
            }
        }),
        // JWKS Check
        measure(async () => {
            try {
                const res = (0, jwks_1.getJwks)();
                if (!res.keys || res.keys.length === 0)
                    throw new Error('No keys generated');
                const key = res.keys[0];
                if (!key.kid || !key.n || !key.e)
                    throw new Error('Invalid JWK structure');
            }
            catch (err) {
                throw new Error('JWKS generation failed');
            }
        })
    ]);
    const ready = db.ok && jwtKeys.ok && jwks.ok;
    if (!ready) {
        logger_1.logger.error('Readiness checks failed', { db, jwtKeys, jwks });
    }
    return {
        ready,
        service: (0, runtime_1.getServiceName)(),
        time: (0, runtime_1.getIsoTimeNow)(),
        checks: {
            database: db,
            jwtKeys,
            jwks
        }
    };
};
exports.runReadinessChecks = runReadinessChecks;
