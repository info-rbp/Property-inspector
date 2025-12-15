import React from 'react';
import { Component, JobStatus } from '../types';
interface ComponentPanelProps {
    component: Component;
    jobStatus: JobStatus;
    isLocked: boolean;
}
export declare const ComponentPanel: React.FC<ComponentPanelProps>;
export {};
