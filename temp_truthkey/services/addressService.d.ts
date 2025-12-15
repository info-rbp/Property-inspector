export interface AddressSuggestion {
    place_id: string;
    display_name: string;
    lat?: string;
    lon?: string;
}
export interface ValidatedAddress {
    formattedAddress: string;
    placeId: string;
    location: {
        lat: number;
        lng: number;
    };
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;
    councilArea: string;
}
declare global {
    interface Window {
        google: any;
    }
}
export declare const getAddressSuggestions: (query: string) => Promise<AddressSuggestion[]>;
export declare const validateAddress: (query: string) => Promise<ValidatedAddress | null>;
