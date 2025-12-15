"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendActivationEmail = void 0;
const notificationsClient_1 = require("../clients/notificationsClient");
const sendActivationEmail = async (email, token, tenantId = 'system') => {
    // Construct the link (In production, this base URL comes from env)
    // Assuming a separate UI domain
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const activationLink = `${dashboardUrl}/activate?token=${token}`;
    await notificationsClient_1.notificationsClient.send({
        tenantId,
        type: 'USER_ACTIVATION',
        channel: 'email',
        to: email,
        templateId: 'user_activation_v1',
        idempotencyKey: `activation_${token.substring(0, 8)}`,
        variables: {
            activationUrl: activationLink,
            activationToken: token
        }
    });
};
exports.sendActivationEmail = sendActivationEmail;
