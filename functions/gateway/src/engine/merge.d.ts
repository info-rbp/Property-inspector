import { IssueSeverity } from '@prisma/client';
export type MergeContext = {
    tenantId: string;
    inspectionId: string;
    analysisRunId: string;
};
export type AiAnalysisResult = {
    roomId: string;
    componentName: string;
    condition: {
        isClean: boolean;
        isUndamaged: boolean;
        isWorking: boolean;
    };
    overviewComment: string;
    issues: Array<{
        type: string;
        severity: IssueSeverity;
        confidence: number;
        notes: string;
    }>;
};
/**
 * Merges AI results into System of Record respecting Human Edits
 */
export declare function mergeAiAnalysis(ctx: MergeContext, results: AiAnalysisResult[]): Promise<void>;
