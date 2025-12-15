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
export declare const runReadinessChecks: () => Promise<ReadinessResult>;
export {};
