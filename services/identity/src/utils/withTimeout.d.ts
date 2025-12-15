/**
 * Wraps a promise with a timeout.
 * Used to ensure readiness checks do not hang indefinitely.
 *
 * @param promise The promise to await.
 * @param ms Timeout in milliseconds.
 * @param errorMessage Message to throw on timeout.
 */
export declare const withTimeout: <T>(promise: Promise<T>, ms: number, errorMessage?: string) => Promise<T>;
