"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const config_1 = require("./config");
// Import route handlers
const health_1 = require("./routes/health");
const inspections_1 = require("./routes/inspections");
const media_1 = require("./routes/media");
const analysis_1 = require("./routes/analysis");
const reports_1 = require("./routes/reports");
// Import middleware
const auth_1 = require("./middleware/auth");
const error_1 = require("./middleware/error");
async function buildApp(options = {}) {
    const app = (0, fastify_1.default)(options);
    // Register core plugins
    await app.register(cors_1.default, {
        origin: config_1.config.corsOrigins,
        credentials: true
    });
    await app.register(helmet_1.default, {
        contentSecurityPolicy: false // Configure based on your needs
    });
    await app.register(rate_limit_1.default, {
        max: config_1.config.RATE_LIMIT_MAX,
        timeWindow: config_1.config.RATE_LIMIT_WINDOW
    });
    await app.register(jwt_1.default, {
        secret: config_1.config.JWT_SECRET,
        sign: {
            expiresIn: config_1.config.JWT_EXPIRES_IN,
            issuer: config_1.config.JWT_ISSUER,
            audience: config_1.config.JWT_AUDIENCE
        }
    });
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB max file size
        }
    });
    // API Documentation
    await app.register(swagger_1.default, {
        openapi: {
            info: {
                title: 'ProInspect Gateway API',
                description: 'Core API for property inspection platform',
                version: '1.0.0'
            },
            servers: [
                {
                    url: config_1.config.API_BASE_URL,
                    description: 'Gateway API Server'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    },
                    serviceAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'X-Service-Secret'
                    }
                }
            }
        }
    });
    await app.register(swagger_ui_1.default, {
        routePrefix: '/docs',
        staticCSP: true,
        transformStaticCSP: (header) => header,
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true
        }
    });
    // Register middleware
    app.setErrorHandler(error_1.errorHandler);
    app.addHook('onRequest', auth_1.authMiddleware);
    // Register routes
    await app.register(health_1.healthRoutes, { prefix: '/api/v1' });
    await app.register(inspections_1.inspectionRoutes, { prefix: '/api/v1/inspections' });
    await app.register(media_1.mediaRoutes, { prefix: '/api/v1/media' });
    await app.register(analysis_1.analysisRoutes, { prefix: '/api/v1/analysis' });
    await app.register(reports_1.reportRoutes, { prefix: '/api/v1/reports' });
    return app;
}
