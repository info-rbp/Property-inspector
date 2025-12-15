"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const logger_1 = __importDefault(require("../utils/logger"));
const template_service_1 = require("../services/template.service");
const process_1 = __importDefault(require("process"));
async function run() {
    logger_1.default.info('Starting migration...');
    const schemaPath = path_1.default.join(__dirname, '../db/schema.sql');
    const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
    try {
        await db_1.db.query(schemaSql);
        logger_1.default.info('Schema applied.');
        logger_1.default.info('Seeding templates...');
        await new template_service_1.TemplateService().seedTemplates();
        logger_1.default.info('Templates seeded.');
        process_1.default.exit(0);
    }
    catch (e) {
        logger_1.default.error('Migration failed', e);
        process_1.default.exit(1);
    }
}
run();
