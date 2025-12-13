import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { AppError } from '../utils/errors';
import { InspectionData, BrandingConfig } from '../types';

// Declare __dirname as it is not available in the types
declare const __dirname: string;

// Register Helpers
handlebars.registerHelper('formatDate', (dateString) => {
  return new Date(dateString).toLocaleDateString();
});

handlebars.registerHelper('eq', (a, b) => a === b);

interface TemplateDefinition {
  html: string;
  version: string;
}

export class TemplateService {
  private templates: Map<string, TemplateDefinition> = new Map();

  constructor() {
    // In a real app, load from Storage or DB. Here, we load from filesystem on startup.
    this.loadTemplates();
  }

  private loadTemplates() {
    // Mock loading a "modern" template
    const templatePath = path.join(__dirname, '../templates/modern_v1.html');
    try {
      if (fs.existsSync(templatePath)) {
        const html = fs.readFileSync(templatePath, 'utf-8');
        this.templates.set('template_modern_v1', { html, version: '1.0.0' });
        console.log('Loaded template: template_modern_v1');
      } else {
        console.warn('Template file not found at', templatePath);
      }
    } catch (e) {
      console.error('Failed to load templates', e);
    }
  }

  render(templateId: string, data: InspectionData, branding: BrandingConfig): string {
    const templateDef = this.templates.get(templateId);
    
    if (!templateDef) {
      throw new AppError('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`, 422);
    }

    const compile = handlebars.compile(templateDef.html);
    
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

  getVersion(templateId: string): string {
    return this.templates.get(templateId)?.version || 'unknown';
  }
}

export const templateService = new TemplateService();