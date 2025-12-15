import { Photo } from "../types";
export declare const generateImageTags: (photo: Photo) => Promise<string[]>;
export declare const generateOverallComment: (roomName: string, photos: Photo[], currentComment: string) => Promise<string>;
export declare const generateItemComment: (itemName: string, roomName: string, photos: Photo[], currentComment: string) => Promise<{
    comment: string;
    isClean: boolean;
    isUndamaged: boolean;
    isWorking: boolean;
}>;
