
import nodemailer from 'nodemailer';
import { EmailMessage, EmailProvider, SendResult } from './types';
import { config } from '../../config';
import logger from '../../utils/logger';

export class SmtpProvider implements EmailProvider {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // true for 465, false for other ports
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async sendEmail(message: EmailMessage): Promise<SendResult> {
    const mailOptions = {
      from: `"${message.fromName || 'System'}" <${config.smtp.from}>`,
      to: message.to,
      cc: message.cc,
      bcc: message.bcc,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent via SMTP', { messageId: info.messageId, to: message.to });
      return {
        providerMessageId: info.messageId,
        rawResponse: info,
      };
    } catch (error: any) {
      logger.error('SMTP Provider Error', { error: error.message });
      throw error;
    }
  }
}
