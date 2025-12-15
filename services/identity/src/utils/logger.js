"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (msg, meta) => console.log(`[INFO] ${msg}`, meta ? JSON.stringify(meta) : ''),
    error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta ? JSON.stringify(meta) : ''),
    warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta ? JSON.stringify(meta) : ''),
};
