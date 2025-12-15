export declare const fileToBase64: (file: File) => Promise<string>;
declare global {
    interface Window {
        heic2any: any;
    }
}
export declare const processImageFile: (file: File) => Promise<File>;
export declare const generateId: () => string;
export declare const getInitialItemsForRoom: (roomName: string) => string[];
