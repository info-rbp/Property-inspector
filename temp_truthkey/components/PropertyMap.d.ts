import React from 'react';
interface PropertyMapProps {
    lat: number;
    lng: number;
    title?: string;
}
declare global {
    interface Window {
        google: any;
    }
}
export declare const PropertyMap: React.FC<PropertyMapProps>;
export {};
