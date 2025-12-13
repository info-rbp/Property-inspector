/**
 * Centralized runtime metadata for diagnostics.
 * Ensures consistent reporting of version, time, and service identity.
 */

export const getServiceName = () => process.env.SERVICE_NAME || 'identity-service';

export const getVersion = () => 
  process.env.SERVICE_VERSION || process.env.COMMIT_SHA || 'dev';

export const getCommitSha = () => process.env.COMMIT_SHA || null;

export const getUptimeSeconds = () => (process as any).uptime();

export const getIsoTimeNow = () => new Date().toISOString();