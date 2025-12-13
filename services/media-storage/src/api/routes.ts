import { Router } from 'express';
import { initiateUpload, completeUpload } from './controllers/upload';
import { getMedia, listMedia, getReadUrls, toggleLegalHold } from './controllers/retrieval';
import { createPolicy, listPolicies, applyPolicy } from './controllers/retention';
import { authMiddleware } from './middleware/auth';

const router = Router();

// Apply Auth Middleware to all routes
router.use('/media', authMiddleware);
router.use('/inspections', authMiddleware);
router.use('/retention-policies', authMiddleware);

// Upload Flow
router.post('/media/initiate-upload', initiateUpload);
router.post('/media/complete-upload', completeUpload);

// Retrieval
router.get('/media/:mediaId', getMedia);
router.get('/media/:mediaId/read-url', getReadUrls); 
router.post('/media/:mediaId/legal-hold', toggleLegalHold);
router.post('/media/:mediaId/retention', applyPolicy);

router.get('/inspections/:inspectionId/media', listMedia);

// Retention Policies
router.post('/retention-policies', createPolicy);
router.get('/retention-policies', listPolicies);

export const mediaRoutes = router;