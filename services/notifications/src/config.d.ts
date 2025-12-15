export declare const config: {
    port: string | number;
    env: string;
    db: {
        url: string;
    };
    security: {
        serviceAuthSecret: string;
        jwtJwksUrl: string | undefined;
    };
    services: {
        brandingBaseUrl: string | undefined;
        reportBaseUrl: string | undefined;
    };
    cloudTasks: {
        project: string;
        queue: string;
        location: string;
        workerUrl: string;
    };
    logic: {
        maxAttempts: number;
    };
    smtp: {
        host: string | undefined;
        port: number;
        user: string | undefined;
        pass: string | undefined;
        from: string;
    };
};
