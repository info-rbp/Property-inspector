"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPayload = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a SHA256 hash of a JSON payload.
 * Canonicalizes the JSON (sorts keys) to ensure deterministic hashing.
 */
const hashPayload = (payload) => {
    // Simple canonicalization: JSON.stringify usually preserves order, 
    // but for strict crypto guarantees, we should sort keys.
    const canonicalString = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto_1.default.createHash('sha256').update(canonicalString).digest('hex');
};
exports.hashPayload = hashPayload;
