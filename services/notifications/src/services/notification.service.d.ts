interface EnqueueParams {
    tenantId: string;
    type: string;
    channel: string;
    to: string;
    templateId: string;
    idempotencyKey: string;
    correlationId?: string;
    sourceService?: string;
    triggeredBy: {
        actorType: string;
        actorId?: string;
    };
    variables: any;
}
export declare class NotificationService {
    /**
     * 1. Receive Request
     * 2. Insert into DB (Idempotent)
     * 3. Enqueue Task
     */
    enqueue(params: EnqueueParams): Promise<any>;
    /**
     * Preview a notification without sending it.
     */
    preview(params: {
        tenantId: string;
        templateId: string;
        variables: any;
    }): Promise<import("./template.service").RenderedContent>;
    /**
     * Worker Logic
     */
    processDelivery(notificationId: string): Promise<void>;
    private calculateBackoff;
    getStatus(notificationId: string, tenantId: string): Promise<any>;
}
export {};
