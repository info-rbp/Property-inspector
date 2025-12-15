export declare class QueueService {
    /**
     * Enqueues a task to process a notification.
     * Logic: If running locally (config.project === 'local'), it fires directly (async).
     * Otherwise, it creates a real Google Cloud Task.
     */
    enqueueDelivery(notificationId: string, delaySeconds?: number): Promise<void>;
    private localDispatch;
}
