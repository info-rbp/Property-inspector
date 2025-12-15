export interface EmailMessage {
    to: string;
    cc?: string;
    bcc?: string;
    fromName?: string;
    replyTo?: string;
    subject: string;
    html: string;
    text?: string;
}
export interface SendResult {
    providerMessageId: string;
    rawResponse?: any;
}
export interface EmailProvider {
    sendEmail(message: EmailMessage): Promise<SendResult>;
}
