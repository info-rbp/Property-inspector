"use strict";
/**
 * Centralized runtime metadata for diagnostics.
 * Ensures consistent reporting of version, time, and service identity.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsoTimeNow = exports.getUptimeSeconds = exports.getCommitSha = exports.getVersion = exports.getServiceName = void 0;
const getServiceName = () => process.env.SERVICE_NAME || 'identity-service';
exports.getServiceName = getServiceName;
const getVersion = () => process.env.SERVICE_VERSION || process.env.COMMIT_SHA || 'dev';
exports.getVersion = getVersion;
const getCommitSha = () => process.env.COMMIT_SHA || null;
exports.getCommitSha = getCommitSha;
const getUptimeSeconds = () => process.uptime();
exports.getUptimeSeconds = getUptimeSeconds;
const getIsoTimeNow = () => new Date().toISOString();
exports.getIsoTimeNow = getIsoTimeNow;
