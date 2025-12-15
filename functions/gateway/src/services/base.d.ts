import { AxiosInstance } from 'axios';
export declare abstract class BaseClient {
    protected client: AxiosInstance;
    protected serviceName: string;
    constructor(serviceName: string, baseURL: string);
    protected handleError(error: unknown, context: string): never;
    healthCheck(): Promise<{
        status: 'ok' | 'error';
        latency: number;
    }>;
}
