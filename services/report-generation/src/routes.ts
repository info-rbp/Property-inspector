import { Router } from 'express';
import { reportController } from './controllers/reportController';

const router = Router();

// Middleware to mock requestId if needed
router.use((req, res, next) => {
  // Check auth here in real app
  next();
});

// Generation
router.post('/reports/generate', (req, res) => reportController.generate(req, res));
router.post('/reports/:reportId/finalize', (req, res) => reportController.finalize(req, res));

// Retrieval
router.get('/reports/:reportId', (req, res) => reportController.getMetadata(req, res));
router.get('/reports/:reportId/download', (req, res) => reportController.download(req, res));

// Listing
router.get('/inspections/:inspectionId/reports', (req, res) => reportController.list(req, res));

export default router;