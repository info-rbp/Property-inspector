import React from 'react';
import { Property, Inspection, PropertyAttributes } from '../types';
interface PropertyProfileProps {
    property: Property;
    inspections: Inspection[];
    onStartInspection: (propertyId: string) => void;
    onUpdateField: (field: keyof PropertyAttributes, value: any) => void;
    onUpdateProperty: (updates: Partial<Property>) => void;
}
export declare const PropertyProfile: React.FC<PropertyProfileProps>;
export {};
