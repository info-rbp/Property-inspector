import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/env';

export abstract class BaseClient {
  protected client: AxiosInstance;
  protected serviceName: string;

  constructor(serviceName: string, baseURL: string) {
    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL,
      timeout: 3000, // Strict 3s timeout
    });

    this.client.interceptors.request.use(config => {
      // Inject Service Auth Header for internal traffic
      config.headers['X-Service-Auth'] = env.SERVICE_AUTH_SECRET;
      // In a real request context, we would inject the incoming correlation ID
      // For now, simple client config
      return config;
    });
  }

  protected handleError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const ae = error as AxiosError;
      throw new Error(`[${this.serviceName}] ${context}: ${ae.message} (${ae.response?.status ?? 'No Status'})`);
    }
    throw error;
  }

  public async healthCheck(): Promise<{ status: 'ok' | 'error', latency: number }> {
    const start = performance.now();
    try {
      await this.client.get('/v1/health');
      return { status: 'ok', latency: Math.round(performance.now() - start) };
    } catch (e) {
      return { status: 'error', latency: Math.round(performance.now() - start) };
    }
  }
}