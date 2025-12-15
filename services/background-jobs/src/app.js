"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const jobController = __importStar(require("./controllers/jobController"));
const workerController = __importStar(require("./controllers/workerController"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));
// --- Public API (Tenant Scoped) ---
const apiRouter = express_1.default.Router();
apiRouter.use(auth_1.requireAuth);
apiRouter.post('/jobs', jobController.createJob);
apiRouter.get('/jobs/:jobId', jobController.getJob);
apiRouter.post('/jobs/:jobId/cancel', jobController.cancelJob);
apiRouter.get('/inspections/:inspectionId/jobs', jobController.listJobs);
app.use('/v1', apiRouter);
// --- Internal Worker API (Service Scoped) ---
const workerRouter = express_1.default.Router();
workerRouter.use(auth_1.requireServiceAuth);
workerRouter.post('/worker/run', workerController.runWorker);
workerRouter.post('/maintenance/stuck-jobs', workerController.cronStuckJobs);
app.use('/internal', workerRouter);
exports.default = app;
