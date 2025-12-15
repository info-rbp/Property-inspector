"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpProvider = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config");
const logger_1 = __importDefault(require("../../utils/logger"));
class SmtpProvider {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.config.smtp.host,
            port: config_1.config.smtp.port,
            secure: config_1.config.smtp.port === 465, // true for 465, false for other ports
            auth: {
                user: config_1.config.smtp.user,
                pass: config_1.config.smtp.pass,
            },
        });
    }
    async sendEmail(message) {
        const mailOptions = {
            from: `"${message.fromName || 'System'}" <${config_1.config.smtp.from}>`,
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
            logger_1.default.info('Email sent via SMTP', { messageId: info.messageId, to: message.to });
            return {
                providerMessageId: info.messageId,
                rawResponse: info,
            };
        }
        catch (error) {
            logger_1.default.error('SMTP Provider Error', { error: error.message });
            throw error;
        }
    }
}
exports.SmtpProvider = SmtpProvider;
