import { InspectionData, BrandingConfig } from '../types';
export declare class TemplateService {
    private templates;
    constructor();
    private loadTemplates;
    render(templateId: string, data: InspectionData, branding: BrandingConfig): string;
    getVersion(templateId: string): string;
}
export declare const templateService: TemplateService;
