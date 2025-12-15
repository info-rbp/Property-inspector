import React, { PropsWithChildren } from "react";
import { Inspection, Property } from "../types";
export interface AppSettings {
    agencyName?: string;
    defaultInspectorName?: string;
}
export interface AppState {
    properties: Property[];
    reports: Inspection[];
    activePropertyId?: string;
    settings: AppSettings;
}
type Action = {
    type: "HYDRATE";
    payload: AppState;
} | {
    type: "ADD_PROPERTY";
    payload: Property;
} | {
    type: "UPDATE_PROPERTY";
    payload: Property;
} | {
    type: "SET_ACTIVE_PROPERTY";
    payload?: string;
} | {
    type: "ADD_REPORT";
    payload: Inspection;
} | {
    type: "UPDATE_REPORT";
    payload: Inspection;
} | {
    type: "DELETE_REPORT";
    payload: string;
} | {
    type: "UPDATE_SETTINGS";
    payload: Partial<AppSettings>;
};
export declare function StoreProvider({ children }: PropsWithChildren): React.JSX.Element | null;
export declare function useStore(): {
    state: AppState;
    dispatch: React.Dispatch<Action>;
};
export {};
