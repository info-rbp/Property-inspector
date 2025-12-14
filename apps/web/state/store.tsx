
import React, { createContext, useContext, useEffect, useMemo, useReducer, PropsWithChildren } from "react";
import { Inspection, Property, Room } from "@/types";
import { generateId } from "../utils";

// --- MOCK DATA FOR INITIAL HYDRATION ---
const MOCK_PROPERTY: Property = {
  id: 'prop-1',
  address: '24 Nightingale Lane, Chatswood NSW 2067',
  ownerName: 'Jane Doe',
  tenantName: 'John Smith',
  tenantEmail: 'john.smith@example.com',
  defaultRooms: ['Kitchen', 'Bathroom', 'Bedroom 1', 'Living Room'],
  thumbnailUrl: `https://source.unsplash.com/random/800x600?house,${Math.random()}`
};

const MOCK_ROOMS: Room[] = [
    {
        id: generateId(),
        name: 'Kitchen',
        items: [],
        photos: [],
        overallComment: 'Clean and tidy'
    },
    {
        id: generateId(),
        name: 'Bathroom',
        items: [],
        photos: [],
        overallComment: 'Grout discoloured'
    }
];

const MOCK_INSPECTION: Inspection = {
  id: 'insp-1',
  propertyId: 'prop-1',
  date: '2023-11-01T10:00:00Z',
  inspectorName: 'Sarah Jenkins',
  status: 'completed',
  summary: 'Routine inspection. Good condition.',
  rooms: MOCK_ROOMS
};

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

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "ADD_PROPERTY"; payload: Property }
  | { type: "UPDATE_PROPERTY"; payload: { id: string, updates: Partial<Property> } }
  | { type: "SET_ACTIVE_PROPERTY"; payload?: string }
  | { type: "ADD_REPORT"; payload: Inspection }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> };

const initialState: AppState = {
  properties: [MOCK_PROPERTY],
  reports: [MOCK_INSPECTION],
  activePropertyId: undefined,
  settings: { agencyName: "ProInspect Demo", defaultInspectorName: "John Doe" },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.payload, properties: action.payload.properties || [], reports: action.payload.reports || [] };

    case "ADD_PROPERTY":
      return { ...state, properties: [...state.properties, action.payload] };

    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map(p => 
            p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case "SET_ACTIVE_PROPERTY":
      return { ...state, activePropertyId: action.payload };

    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] };

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    default:
      return state;
  }
}

const StoreCtx = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const STORAGE_KEY = "proinspect_platform_v2";

function safeParse(json: string | null): AppState | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    // Basic shape validation
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.properties) && Array.isArray(parsed.reports)) {
        return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
        dispatch({ type: "HYDRATE", payload: saved });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  if (!isHydrated) return null;

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
