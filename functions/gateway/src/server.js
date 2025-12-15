"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const prisma = new client_1.PrismaClient();
const app = (0, app_1.buildApp)({
    logger: {
        level: config_1.config.LOG_LEVEL,
        ...(config_1.config.LOG_PRETTY && {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname'
                }
            }
        })
    }
});
exports.default = app;
