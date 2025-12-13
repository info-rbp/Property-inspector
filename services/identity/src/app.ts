import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import routes from './routes';
import { AppError } from './utils/errors';
import { z, ZodError } from 'zod';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_SEC * 1000,
  max: config.RATE_LIMIT_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/v1', limiter);

// Routes
app.use('/v1', routes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors,
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.headers['x-request-id'] || 'unknown'
    }
  });
});

export default app;