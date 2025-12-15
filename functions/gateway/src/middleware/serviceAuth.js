"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyServiceAuth = void 0;
const env_1 = require("../config/env");
const verifyServiceAuth = async (req, reply) => {
    const secret = req.headers['x-service-auth'];
    if (secret !== env_1.env.SERVICE_AUTH_SECRET) {
        return reply.status(401).send({ error: 'Invalid Service Secret' });
    }
};
exports.verifyServiceAuth = verifyServiceAuth;
