const {onRequest} = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const { ApiError, Client, Environment } = require('square');
const crypto = require('crypto');

admin.initializeApp();

// Webhook signature key from Firebase Functions config
const webhookSignatureKey = process.env.SQUARE_SQUARE_WEBHOOK_SIGNATURE_KEY_USAGE;

exports.handleSquareUsageWebhook = onRequest(async (req, res) => {
  // Verify the webhook signature
  const signature = req.headers['x-square-hmacsha256-signature'];
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const requestBody = JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  hmac.update(url + requestBody);
  const hash = hmac.digest('base64');

  if (hash !== signature) {
    res.status(401).send('Unauthorized');
    return;
  }

  // TODO: Process the webhook event

  res.status(200).send('OK');
});
