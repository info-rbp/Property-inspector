"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateService = exports.TemplateService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const errors_1 = require("../utils/errors");
// Register Helpers
handlebars_1.default.registerHelper('formatDate', (dateString) => {
    return new Date(dateString).toLocaleDateString();
});
handlebars_1.default.registerHelper('eq', (a, b) => a === b);
class TemplateService {
    templates = new Map();
    constructor() {
        // In a real app, load from Storage or DB. Here, we load from filesystem on startup.
        this.loadTemplates();
    }
    loadTemplates() {
        // Mock loading a "modern" template
        const templatePath = path_1.default.join(__dirname, '../templates/modern_v1.html');
        try {
            if (fs_1.default.existsSync(templatePath)) {
                const html = fs_1.default.readFileSync(templatePath, 'utf-8');
                this.templates.set('template_modern_v1', { html, version: '1.0.0' });
                console.log('Loaded template: template_modern_v1');
            }
            else {
                console.warn('Template file not found at', templatePath);
            }
        }
        catch (e) {
            console.error('Failed to load templates', e);
        }
    }
    render(templateId, data, branding) {
        const templateDef = this.templates.get(templateId);
        if (!templateDef) {
            throw new errors_1.AppError('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`, 422);
        }
        const compile = handlebars_1.default.compile(templateDef.html);
        // Combine contexts
        const context = {
            ...data,
            branding,
            meta: {
                generatedAt: new Date().toISOString(),
            }
        };
        return compile(context);
    }
    getVersion(templateId) {
        return this.templates.get(templateId)?.version || 'unknown';
    }
}
exports.TemplateService = TemplateService;
exports.templateService = new TemplateService();
