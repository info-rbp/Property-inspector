"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = void 0;
/**
 * Wraps a promise with a timeout.
 * Used to ensure readiness checks do not hang indefinitely.
 *
 * @param promise The promise to await.
 * @param ms Timeout in milliseconds.
 * @param errorMessage Message to throw on timeout.
 */
const withTimeout = (promise, ms, errorMessage = 'Operation timed out') => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
    });
    return Promise.race([
        promise.then((res) => {
            clearTimeout(timeoutId);
            return res;
        }),
        timeoutPromise
    ]);
};
exports.withTimeout = withTimeout;
