import { EmailMessage, EmailProvider, SendResult } from './types';
export declare class SmtpProvider implements EmailProvider {
    private transporter;
    constructor();
    sendEmail(message: EmailMessage): Promise<SendResult>;
}
