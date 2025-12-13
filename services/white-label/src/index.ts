import app from './app.js';
import { config } from './config.js';

const server = app.listen(config.PORT, () => {
    console.log(`🚀 Branding Service running on port ${config.PORT} [${config.NODE_ENV}]`);
});

// Graceful shutdown
(process as any).on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});