interface NotificationPayload {
    tenantId: string;
    type: string;
    channel: 'email' | 'sms' | 'push';
    to: string;
    templateId: string;
    idempotencyKey?: string;
    variables: Record<string, any>;
}
export declare const notificationsClient: {
    send: (payload: NotificationPayload) => Promise<void>;
};
export {};
