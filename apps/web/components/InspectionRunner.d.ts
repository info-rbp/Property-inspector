import React from 'react';
import { Property, Inspection } from '@/types';
interface InspectionRunnerProps {
    property: Property;
    onClose: () => void;
    onSave: (inspection: Inspection) => void;
}
export declare const InspectionRunner: React.FC<InspectionRunnerProps>;
export {};
