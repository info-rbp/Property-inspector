
import app from './app';
import { config } from './config';

app.listen(config.PORT, () => {
  console.log(`Billing Service running on port ${config.PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
