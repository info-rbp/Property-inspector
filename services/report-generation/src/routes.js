"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("./controllers/reportController");
const router = (0, express_1.Router)();
// Middleware to mock requestId if needed
router.use((req, res, next) => {
    // Check auth here in real app
    next();
});
// Generation
router.post('/reports/generate', (req, res) => reportController_1.reportController.generate(req, res));
router.post('/reports/:reportId/finalize', (req, res) => reportController_1.reportController.finalize(req, res));
// Retrieval
router.get('/reports/:reportId', (req, res) => reportController_1.reportController.getMetadata(req, res));
router.get('/reports/:reportId/download', (req, res) => reportController_1.reportController.download(req, res));
// Listing
router.get('/inspections/:inspectionId/reports', (req, res) => reportController_1.reportController.list(req, res));
exports.default = router;
