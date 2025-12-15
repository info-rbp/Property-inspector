import React from 'react';
import { Property, Inspection } from '@/types';
interface PropertyProfileProps {
    property: Property;
    inspections: Inspection[];
    onStartInspection: () => void;
    onUpdateProperty: (updates: Partial<Property>) => void;
}
export declare const PropertyProfile: React.FC<PropertyProfileProps>;
export {};
