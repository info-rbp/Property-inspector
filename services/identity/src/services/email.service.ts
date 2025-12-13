import { notificationsClient } from '../clients/notificationsClient';

export const sendActivationEmail = async (email: string, token: string, tenantId: string = 'system') => {
  // Construct the link (In production, this base URL comes from env)
  // Assuming a separate UI domain
  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5173';
  const activationLink = `${dashboardUrl}/activate?token=${token}`;

  await notificationsClient.send({
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