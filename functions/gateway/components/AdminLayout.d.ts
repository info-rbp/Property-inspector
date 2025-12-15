import React from 'react';
import { ViewState } from '../types';
interface AdminLayoutProps {
    children: React.ReactNode;
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
}
export declare const AdminLayout: React.FC<AdminLayoutProps>;
export {};
