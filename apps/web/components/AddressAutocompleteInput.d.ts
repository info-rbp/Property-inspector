import React from 'react';
import { AddressSuggestion } from '../services/addressService';
interface Props {
    value: string;
    onChange: (val: string) => void;
    onSelect: (suggestion: AddressSuggestion) => void;
    placeholder?: string;
    autoFocus?: boolean;
}
export declare const AddressAutocompleteInput: React.FC<Props>;
export {};
