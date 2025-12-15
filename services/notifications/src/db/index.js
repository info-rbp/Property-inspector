"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
const process_1 = __importDefault(require("process"));
const pool = new pg_1.Pool({
    connectionString: config_1.config.db.url,
    max: 20,
    idleTimeoutMillis: 30000,
});
pool.on('error', (err) => {
    logger_1.default.error('Unexpected error on idle client', { error: err.message });
    process_1.default.exit(-1);
});
exports.db = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};
