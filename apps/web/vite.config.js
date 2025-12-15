"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
exports.default = (0, vite_1.defineConfig)(({ mode }) => {
    const env = (0, vite_1.loadEnv)(mode, '.', '');
    return {
        server: {
            host: true, // Bind to 0.0.0.0 so it’s reachable from outside the container
            port: 5173, // Use a dedicated port for inspection-ui
            strictPort: true // Fail if 5173 is taken instead of silently incrementing
        },
        plugins: [(0, plugin_react_1.default)()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path_1.default.resolve(__dirname, '.'),
            }
        }
    };
});
