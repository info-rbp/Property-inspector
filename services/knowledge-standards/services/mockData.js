"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_DATA = void 0;
const types_2 = require("../types");
const generateId = () => Math.random().toString(36).substring(2, 15);
const now = new Date().toISOString();
exports.INITIAL_DATA = [
    // --- Defects ---
    {
        id: generateId(),
        type: types_2.StandardType.DEFECT,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        code: 'crack',
        description: 'Visible separation or fracture in a surface',
        appliesTo: ['walls', 'ceilings', 'tiles', 'concrete', 'cladding'],
        excludedConditions: ['hairline shadow', 'paint reflection', 'crazing']
    },
    {
        id: generateId(),
        type: types_2.StandardType.DEFECT,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        code: 'water_stain',
        description: 'Discoloration indicating past or present moisture intrusion',
        appliesTo: ['ceilings', 'walls', 'timber'],
        excludedConditions: ['shadows', 'paint variation']
    },
    // --- Severity ---
    {
        id: generateId(),
        type: types_2.StandardType.SEVERITY,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        severityLevel: 'major',
        definition: 'Extensive, structural-appearing, or repair-requiring damage',
        visualIndicators: ['wide crack (>2mm)', 'multiple broken tiles', 'significant material loss'],
        nonIndicators: ['minor scuffs', 'surface marks', 'hairline cracks']
    },
    {
        id: generateId(),
        type: types_2.StandardType.SEVERITY,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        severityLevel: 'minor',
        definition: 'Cosmetic imperfection not affecting function',
        visualIndicators: ['scuff marks', 'fine hairline cracks', 'paint chips'],
        nonIndicators: ['structural movement', 'dampness']
    },
    // --- Room Standards ---
    {
        id: generateId(),
        type: types_2.StandardType.ROOM,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        roomType: 'bathroom',
        expectedComponents: ['ceiling', 'walls', 'floor', 'shower area', 'vanity', 'toilet', 'mirror'],
        highRiskDefects: ['water_stain', 'mold', 'sealant_failure'],
        analysisNotes: ['Shadows and reflections common on tiles', 'Moisture staining requires clear edge definition']
    },
    {
        id: generateId(),
        type: types_2.StandardType.ROOM,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        roomType: 'outdoor',
        expectedComponents: ['cladding', 'eaves', 'gutters', 'downpipes', 'pathways'],
        highRiskDefects: ['structural_crack', 'rot'],
        analysisNotes: ['Vegetation may obscure views', 'Harsh lighting may create false contrast']
    },
    // --- Phrasing ---
    {
        id: generateId(),
        type: types_2.StandardType.PHRASING,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        context: 'major_damage',
        allowedPatterns: ['Major damage observed to {component}', 'Significant cracking present to {area}'],
        disallowedPatterns: ['Appears dangerous', 'Likely caused by', 'Should be repaired']
    },
    // --- Guardrails ---
    {
        id: generateId(),
        type: types_2.StandardType.GUARDRAIL,
        version: 1,
        status: types_2.StandardStatus.ACTIVE,
        tenantId: 'global',
        createdAt: now,
        updatedAt: now,
        author: 'system',
        ruleKey: 'no_assumption_without_visibility',
        description: 'If damage is not clearly visible, mark needsConfirmation=true. Do not hallucinate defects behind furniture.',
        appliesTo: ['all']
    },
];
