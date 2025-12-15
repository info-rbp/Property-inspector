"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeminiApiKey = getGeminiApiKey;
exports.getGoogleMapsApiKey = getGoogleMapsApiKey;
function getGeminiApiKey() {
    // 1. Prefer Vite env injection first (standard for this project structure)
    const vite = import.meta?.env;
    const v = vite?.VITE_GEMINI_API_KEY;
    if (v)
        return String(v);
    // 2. Fall back to runtime-injected values (AI Studio, window globals, standard process.env)
    const w = window;
    const p = globalThis.process;
    return (p?.env?.GEMINI_API_KEY ||
        p?.env?.API_KEY ||
        w?.GEMINI_API_KEY ||
        w?.API_KEY ||
        "");
}
function getGoogleMapsApiKey() {
    // 1. Prefer Vite env injection first
    const vite = import.meta?.env;
    const v = vite?.VITE_GOOGLE_MAPS_API_KEY;
    if (v)
        return String(v);
    // 2. Fall back to runtime-injected values
    const w = window;
    const p = globalThis.process;
    return (p?.env?.GOOGLE_MAPS_API_KEY ||
        w?.GOOGLE_MAPS_API_KEY ||
        "");
}
