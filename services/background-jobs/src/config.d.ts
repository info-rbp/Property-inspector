export declare const config: {
    port: string | number;
    projectId: string;
    firestore: {
        collection: string;
    };
    tasks: {
        queue: string;
        location: string;
        workerUrl: string;
    };
    auth: {
        serviceSecret: string;
    };
    services: {
        analysisUrl: string;
        reportUrl: string;
        inspectionAppUrl: string;
    };
    defaults: {
        maxAttempts: number;
    };
};
