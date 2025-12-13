
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import auditRoutes from './routes/audit.routes';

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Allow slightly larger bodies before offloading logic kicks in
app.use(morgan('combined'));

// Routes
app.use('/v1/audit', auditRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Audit Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
