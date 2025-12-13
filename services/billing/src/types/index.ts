
export enum UsageType {
  PHOTO_ANALYSIS_STANDARD = 'PHOTO_ANALYSIS_STANDARD',
  PHOTO_ANALYSIS_DEEP = 'PHOTO_ANALYSIS_DEEP',
  ROOM_ANALYSIS = 'ROOM_ANALYSIS',
  INSPECTION_ANALYSIS = 'INSPECTION_ANALYSIS',
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_FINALIZED = 'REPORT_FINALIZED',
  REPORT_REGENERATED = 'REPORT_REGENERATED',
  PHOTO_STORED_MB = 'PHOTO_STORED_MB',
  PHOTO_RETAINED_DAYS = 'PHOTO_RETAINED_DAYS',
  INSPECTIONS_CREATED = 'INSPECTIONS_CREATED',
  ACTIVE_USERS = 'ACTIVE_USERS',
}

export interface PlanLimits {
  [key: string]: number;
}

export interface OverageRules {
  allowOverage: boolean;
  hardStop: boolean;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  usage: number;
  periodEndsAt: Date;
  reason: 'within_plan' | 'limit_exceeded' | 'plan_not_found' | 'subscription_inactive' | 'error';
  upgradeRequired: boolean;
}
