"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./controllers/notification.controller");
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
// Internal Services API
router.post('/v1/notifications/send', auth_1.serviceAuth, notification_controller_1.sendNotification);
// Admin Preview API (Protected by Service Auth for system admins or internal tools)
router.post('/v1/notifications/preview', auth_1.serviceAuth, notification_controller_1.previewNotification);
// Public/User API (Tenant scoped)
router.get('/v1/notifications/:id', auth_1.userAuth, notification_controller_1.getNotificationStatus);
// Cloud Tasks Worker Endpoint (Protected by Service Auth)
router.post('/internal/worker/deliver', auth_1.serviceAuth, notification_controller_1.workerDeliver);
exports.default = router;
