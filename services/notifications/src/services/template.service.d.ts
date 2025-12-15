export interface RenderedContent {
    subject: string;
    html: string;
    templateVersion: number;
}
export declare class TemplateService {
    render(templateId: string, variables: any): Promise<RenderedContent>;
    /**
     * Seed templates for the deliverable
     */
    seedTemplates(): Promise<void>;
}
