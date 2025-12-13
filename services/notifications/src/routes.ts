
import { Router } from 'express';
import { sendNotification, getNotificationStatus, workerDeliver, previewNotification } from './controllers/notification.controller';
import { serviceAuth, userAuth } from './middleware/auth';

const router = Router();

// Internal Services API
router.post('/v1/notifications/send', serviceAuth, sendNotification);

// Admin Preview API (Protected by Service Auth for system admins or internal tools)
router.post('/v1/notifications/preview', serviceAuth, previewNotification);

// Public/User API (Tenant scoped)
router.get('/v1/notifications/:id', userAuth, getNotificationStatus);

// Cloud Tasks Worker Endpoint (Protected by Service Auth)
router.post('/internal/worker/deliver', serviceAuth, workerDeliver);

export default router;
