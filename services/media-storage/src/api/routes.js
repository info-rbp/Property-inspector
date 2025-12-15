"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRoutes = void 0;
const express_1 = require("express");
const upload_1 = require("./controllers/upload");
const retrieval_1 = require("./controllers/retrieval");
const retention_1 = require("./controllers/retention");
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
// Apply Auth Middleware to all routes
router.use('/media', auth_1.authMiddleware);
router.use('/inspections', auth_1.authMiddleware);
router.use('/retention-policies', auth_1.authMiddleware);
// Upload Flow
router.post('/media/initiate-upload', upload_1.initiateUpload);
router.post('/media/complete-upload', upload_1.completeUpload);
// Retrieval
router.get('/media/:mediaId', retrieval_1.getMedia);
router.get('/media/:mediaId/read-url', retrieval_1.getReadUrls);
router.post('/media/:mediaId/legal-hold', retrieval_1.toggleLegalHold);
router.post('/media/:mediaId/retention', retention_1.applyPolicy);
router.get('/inspections/:inspectionId/media', retrieval_1.listMedia);
// Retention Policies
router.post('/retention-policies', retention_1.createPolicy);
router.get('/retention-policies', retention_1.listPolicies);
exports.mediaRoutes = router;
