import React from 'react';
interface LayoutProps {
    children: React.ReactNode;
    currentView: string;
    onChangeView: (view: string) => void;
    title: string;
    actions?: React.ReactNode;
}
export declare const Layout: React.FC<LayoutProps>;
export {};
