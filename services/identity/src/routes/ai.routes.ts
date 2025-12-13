import { Router } from 'express';
import * as AiController from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Protect all AI routes with authentication
router.use(requireAuth);

router.post('/chat', AiController.chat);
router.post('/fast', AiController.fast);
router.post('/think', AiController.think);
router.post('/generate', AiController.generate);

export default router;
