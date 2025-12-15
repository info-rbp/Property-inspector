/**
 * Centralized runtime metadata for diagnostics.
 * Ensures consistent reporting of version, time, and service identity.
 */
export declare const getServiceName: () => string;
export declare const getVersion: () => string;
export declare const getCommitSha: () => string | null;
export declare const getUptimeSeconds: () => any;
export declare const getIsoTimeNow: () => string;
