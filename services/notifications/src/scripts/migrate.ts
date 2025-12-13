import fs from 'fs';
import path from 'path';
import { db } from '../db';
import logger from '../utils/logger';
import { TemplateService } from '../services/template.service';
import process from 'process';

declare const __dirname: string;

async function run() {
  logger.info('Starting migration...');
  
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await db.query(schemaSql);
    logger.info('Schema applied.');
    
    logger.info('Seeding templates...');
    await new TemplateService().seedTemplates();
    logger.info('Templates seeded.');

    process.exit(0);
  } catch (e) {
    logger.error('Migration failed', e);
    process.exit(1);
  }
}

run();