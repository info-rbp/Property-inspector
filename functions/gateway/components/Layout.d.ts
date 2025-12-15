import React from 'react';
interface LayoutProps {
    children: React.ReactNode;
    onNavigate: (view: 'dashboard') => void;
    tenantName?: string;
}
export declare const Layout: React.FC<LayoutProps>;
export {};
