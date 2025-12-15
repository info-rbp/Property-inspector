import React from 'react';
interface NavProps {
    currentView: string;
    onChangeView: (view: string) => void;
}
export declare const Navigation: React.FC<NavProps>;
export {};
