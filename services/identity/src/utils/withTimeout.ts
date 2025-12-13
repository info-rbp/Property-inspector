/**
 * Wraps a promise with a timeout.
 * Used to ensure readiness checks do not hang indefinitely.
 * 
 * @param promise The promise to await.
 * @param ms Timeout in milliseconds.
 * @param errorMessage Message to throw on timeout.
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out'): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
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
