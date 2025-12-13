import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import routes from './routes/index.js';
import { handleError } from './utils/errors.js';

const app = express();

// Security headers
app.use(helmet());

// CORS - In production configure this strictly
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Request ID middleware
app.use((req, res, next) => {
    res.locals.requestId = req.headers['x-request-id'] || uuidv4();
    next();
});

// Routes
app.use('/v1', routes);

// 404
app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    handleError(err, res);
});

export default app;