import { Pool } from 'pg';
import { config } from '../config';
import logger from '../utils/logger';
import process from 'process';

const pool = new Pool({
  connectionString: config.db.url,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message });
  process.exit(-1);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};