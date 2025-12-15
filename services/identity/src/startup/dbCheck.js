"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseConnection = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const checkDatabaseConnection = async () => {
    try {
        logger_1.logger.info('Checking database connection...');
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        logger_1.logger.info('✅ Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed', error);
        process.exit(1);
    }
};
exports.checkDatabaseConnection = checkDatabaseConnection;
