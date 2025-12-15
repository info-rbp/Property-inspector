"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const config_js_1 = require("./config.js");
const server = app_js_1.default.listen(config_js_1.config.PORT, () => {
    console.log(`🚀 Branding Service running on port ${config_js_1.config.PORT} [${config_js_1.config.NODE_ENV}]`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
