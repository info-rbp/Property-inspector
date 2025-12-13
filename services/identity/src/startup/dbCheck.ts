import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export const checkDatabaseConnection = async () => {
  try {
    logger.info('Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed', error);
    (process as any).exit(1);
  }
};