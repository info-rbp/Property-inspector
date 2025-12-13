import { KnowledgeItem, StandardStatus, StandardType } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Assumption: UUID logic will be handled by utility in real app, using random string here

const generateId = () => Math.random().toString(36).substring(2, 15);
const now = new Date().toISOString();

export const INITIAL_DATA: KnowledgeItem[] = [
  // --- Defects ---
  {
    id: generateId(),
    type: StandardType.DEFECT,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    code: 'crack',
    description: 'Visible separation or fracture in a surface',
    appliesTo: ['walls', 'ceilings', 'tiles', 'concrete', 'cladding'],
    excludedConditions: ['hairline shadow', 'paint reflection', 'crazing']
  } as any,
  {
    id: generateId(),
    type: StandardType.DEFECT,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    code: 'water_stain',
    description: 'Discoloration indicating past or present moisture intrusion',
    appliesTo: ['ceilings', 'walls', 'timber'],
    excludedConditions: ['shadows', 'paint variation']
  } as any,

  // --- Severity ---
  {
    id: generateId(),
    type: StandardType.SEVERITY,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    severityLevel: 'major',
    definition: 'Extensive, structural-appearing, or repair-requiring damage',
    visualIndicators: ['wide crack (>2mm)', 'multiple broken tiles', 'significant material loss'],
    nonIndicators: ['minor scuffs', 'surface marks', 'hairline cracks']
  } as any,
  {
    id: generateId(),
    type: StandardType.SEVERITY,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    severityLevel: 'minor',
    definition: 'Cosmetic imperfection not affecting function',
    visualIndicators: ['scuff marks', 'fine hairline cracks', 'paint chips'],
    nonIndicators: ['structural movement', 'dampness']
  } as any,

  // --- Room Standards ---
  {
    id: generateId(),
    type: StandardType.ROOM,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    roomType: 'bathroom',
    expectedComponents: ['ceiling', 'walls', 'floor', 'shower area', 'vanity', 'toilet', 'mirror'],
    highRiskDefects: ['water_stain', 'mold', 'sealant_failure'],
    analysisNotes: ['Shadows and reflections common on tiles', 'Moisture staining requires clear edge definition']
  } as any,
  {
    id: generateId(),
    type: StandardType.ROOM,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    roomType: 'outdoor',
    expectedComponents: ['cladding', 'eaves', 'gutters', 'downpipes', 'pathways'],
    highRiskDefects: ['structural_crack', 'rot'],
    analysisNotes: ['Vegetation may obscure views', 'Harsh lighting may create false contrast']
  } as any,

  // --- Phrasing ---
  {
    id: generateId(),
    type: StandardType.PHRASING,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    context: 'major_damage',
    allowedPatterns: ['Major damage observed to {component}', 'Significant cracking present to {area}'],
    disallowedPatterns: ['Appears dangerous', 'Likely caused by', 'Should be repaired']
  } as any,

  // --- Guardrails ---
  {
    id: generateId(),
    type: StandardType.GUARDRAIL,
    version: 1,
    status: StandardStatus.ACTIVE,
    tenantId: 'global',
    createdAt: now,
    updatedAt: now,
    author: 'system',
    ruleKey: 'no_assumption_without_visibility',
    description: 'If damage is not clearly visible, mark needsConfirmation=true. Do not hallucinate defects behind furniture.',
    appliesTo: ['all']
  } as any,
];
