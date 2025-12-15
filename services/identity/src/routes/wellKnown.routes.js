"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwks_1 = require("../security/jwks");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
router.get('/jwks.json', (req, res) => {
    try {
        const jwks = (0, jwks_1.getJwks)();
        // Set caching headers
        res.set('Cache-Control', `public, max-age=${env_1.config.JWKS_CACHE_TTL_SECONDS}`);
        res.set('Content-Type', 'application/json');
        res.json(jwks);
    }
    catch (error) {
        // Secure error handling - do not leak internals
        console.error('JWKS Endpoint Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
