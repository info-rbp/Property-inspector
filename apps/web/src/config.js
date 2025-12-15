"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    GEMINI_API_KEY: import.meta.env.VITE_API_KEY ?? '',
};
