
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import billingRoutes from './routes/billing.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// API Routes
app.use('/v1/billing', billingRoutes);
app.use('/v1/admin/billing', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
