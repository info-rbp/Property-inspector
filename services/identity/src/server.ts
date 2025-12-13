import app from './app';
import { config } from './config/env';
import { checkDatabaseConnection } from './startup/dbCheck';

async function bootstrap() {
  try {
    // 1. Check Database
    await checkDatabaseConnection();

    // 2. Start Server
    app.listen(config.PORT, () => {
      console.log(`🚀 Identity Service running on port ${config.PORT}`);
      console.log(`Health check: http://localhost:${config.PORT}/v1/health`);
      console.log(`JWKS: http://localhost:${config.PORT}/v1/.well-known/jwks.json`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    (process as any).exit(1);
  }
}

bootstrap();