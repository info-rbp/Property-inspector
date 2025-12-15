export declare enum StandardType {
    DEFECT = "defect_taxonomy",
    SEVERITY = "severity_rules",
    ROOM = "room_standards",
    PHRASING = "phrasing_rules",
    GUARDRAIL = "analysis_guardrails"
}
export declare enum StandardStatus {
    ACTIVE = "active",
    DEPRECATED = "deprecated",
    DRAFT = "draft"
}
export interface BaseStandard {
    id: string;
    type: StandardType;
    version: number;
    status: StandardStatus;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    author: string;
}
export interface DefectStandard extends BaseStandard {
    type: StandardType.DEFECT;
    code: string;
    description: string;
    appliesTo: string[];
    excludedConditions: string[];
}
export interface SeverityStandard extends BaseStandard {
    type: StandardType.SEVERITY;
    severityLevel: 'minor' | 'moderate' | 'major' | 'hazardous';
    definition: string;
    visualIndicators: string[];
    nonIndicators: string[];
}
export interface RoomStandard extends BaseStandard {
    type: StandardType.ROOM;
    roomType: string;
    expectedComponents: string[];
    highRiskDefects: string[];
    analysisNotes: string[];
}
export interface PhrasingStandard extends BaseStandard {
    type: StandardType.PHRASING;
    context: string;
    allowedPatterns: string[];
    disallowedPatterns: string[];
}
export interface GuardrailStandard extends BaseStandard {
    type: StandardType.GUARDRAIL;
    ruleKey: string;
    description: string;
    appliesTo: string[];
}
export type KnowledgeItem = DefectStandard | SeverityStandard | RoomStandard | PhrasingStandard | GuardrailStandard;
export interface RetrievalRequest {
    tenantId: string;
    roomType: string;
    components: string[];
    analysisMode: 'FAST' | 'DEEP';
}
export interface RetrievalResponse {
    metadata: {
        retrievalId: string;
        timestamp: string;
        engineVersion: string;
        tenantScope: string;
    };
    context: {
        defects: DefectStandard[];
        severity: SeverityStandard[];
        room: RoomStandard | null;
        phrasing: PhrasingStandard[];
        guardrails: GuardrailStandard[];
    };
}
