import React from 'react';
import { Issue } from '../types';
interface IssueManagerProps {
    issues: Issue[];
    componentId: string;
    isLocked: boolean;
    onRefresh: () => void;
}
export declare const IssueManager: React.FC<IssueManagerProps>;
export {};
