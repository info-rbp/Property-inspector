"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = exports.serviceAuth = void 0;
const config_1 = require("../config");
const serviceAuth = (req, res, next) => {
    const secret = req.headers['x-service-auth'];
    if (secret !== config_1.config.security.serviceAuthSecret) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid Service Secret' } });
    }
    next();
};
exports.serviceAuth = serviceAuth;
// Placeholder for JWT verification
const userAuth = (req, res, next) => {
    // Implement JWT verification using config.security.jwtJwksUrl
    // Verify tenantId claim matches request scope
    next();
};
exports.userAuth = userAuth;
