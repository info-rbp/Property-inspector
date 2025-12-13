// Core Domain Enums
export enum StandardType {
  DEFECT = 'defect_taxonomy',
  SEVERITY = 'severity_rules',
  ROOM = 'room_standards',
  PHRASING = 'phrasing_rules',
  GUARDRAIL = 'analysis_guardrails'
}

export enum StandardStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  DRAFT = 'draft'
}

// Base Interface for all knowledge objects (Versioning & Audit)
export interface BaseStandard {
  id: string;
  type: StandardType;
  version: number;
  status: StandardStatus;
  tenantId: string; // 'global' or specific tenant ID
  createdAt: string;
  updatedAt: string;
  author: string;
}

// 1. Defect Taxonomy
export interface DefectStandard extends BaseStandard {
  type: StandardType.DEFECT;
  code: string;
  description: string;
  appliesTo: string[]; // e.g., ['walls', 'ceilings']
  excludedConditions: string[];
}

// 2. Severity Rules
export interface SeverityStandard extends BaseStandard {
  type: StandardType.SEVERITY;
  severityLevel: 'minor' | 'moderate' | 'major' | 'hazardous';
  definition: string;
  visualIndicators: string[];
  nonIndicators: string[];
}

// 3. Room-Specific Standards
export interface RoomStandard extends BaseStandard {
  type: StandardType.ROOM;
  roomType: string;
  expectedComponents: string[];
  highRiskDefects: string[];
  analysisNotes: string[];
}

// 4. Approved Phrasing Library
export interface PhrasingStandard extends BaseStandard {
  type: StandardType.PHRASING;
  context: string;
  allowedPatterns: string[];
  disallowedPatterns: string[];
}

// 5. Analysis Guardrails
export interface GuardrailStandard extends BaseStandard {
  type: StandardType.GUARDRAIL;
  ruleKey: string;
  description: string;
  appliesTo: string[]; // 'all' or specific components
}

// Union type for usage in generic components
export type KnowledgeItem = 
  | DefectStandard 
  | SeverityStandard 
  | RoomStandard 
  | PhrasingStandard 
  | GuardrailStandard;

// Retrieval Request/Response Types
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
