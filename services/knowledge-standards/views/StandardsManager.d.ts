import React from 'react';
import { StandardType } from '../types';
interface StandardsManagerProps {
    type: StandardType;
    title: string;
    currentView: string;
    onChangeView: (view: string) => void;
}
export declare const StandardsManager: React.FC<StandardsManagerProps>;
export {};
