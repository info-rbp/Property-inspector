
import React, { createContext, useContext, useEffect, useMemo, useReducer, PropsWithChildren } from "react";
import { Inspection, Property, DataSource, PropertyType, ManagedByType, KeyAccessType, ConditionRating } from "../types";

// --- MOCK DATA FOR INITIAL HYDRATION ---
const MOCK_PROPERTY: Property = {
  id: 'PROP-GUID-001',
  thumbnailUrl: 'https://picsum.photos/600/400',
  identity: {
    gnafPid: 'GNAF-12345678',
    address: '24 Nightingale Lane, Chatswood NSW 2067',
    streetNumber: '24',
    streetName: 'Nightingale Lane',
    suburb: 'Chatswood',
    state: 'NSW',
    postcode: '2067',
    councilArea: 'Willoughby City Council',
    latitude: -33.796,
    longitude: 151.183
  },
  legal: {
    lotNumber: '42',
    planNumber: 'DP123456',
    parcelId: 'WCC-8829-X',
    landSizeSqm: 556,
    zoningCode: 'R2',
    zoningDescription: 'Low Density Residential',
    overlays: {
      heritage: true,
      bushfire: false,
      flood: false
    }
  },
  attributes: {
    type: { value: PropertyType.HOUSE, source: DataSource.GNAF, lastUpdated: '2023-01-01T00:00:00Z', confidence: 1 },
    bedrooms: { value: 3, source: DataSource.INSPECTOR, lastUpdated: '2023-11-01T14:30:00Z', confidence: 1 },
    bathrooms: { value: 2, source: DataSource.LICENSED_PROVIDER, lastUpdated: '2023-10-15T09:00:00Z', confidence: 0.9 },
    carSpaces: { value: 1, source: DataSource.LICENSED_PROVIDER, lastUpdated: '2023-10-15T09:00:00Z', confidence: 0.8 },
    yearBuilt: { value: 1985, source: DataSource.LICENSED_PROVIDER, lastUpdated: '2023-10-15T09:00:00Z', confidence: 0.7 },
    floorAreaSqm: { value: 180, source: DataSource.LICENSED_PROVIDER, lastUpdated: '2023-10-15T09:00:00Z', confidence: 0.8 },
    constructionMaterial: { value: 'Double Brick', source: DataSource.INSPECTOR, lastUpdated: '2023-11-01T10:00:00Z', confidence: 1 }
  },
  salesHistory: [
    { date: '2019-05-20', price: 2450000, type: 'Auction', settlementDate: '2019-07-01' },
    { date: '2012-11-15', price: 1650000, type: 'Private Treaty' }
  ],
  rentalContext: {
    medianRentSuburb: 1100,
    medianRentType: 1250,
    medianRentBedrooms: 1150,
    vacancyRate: 1.2,
    trend12Month: 'up',
    lastAdvertisedWeekly: 1150,
    lastAdvertisedDate: '2022-01-10'
  },
  location: {
    schools: [
      { name: 'Chatswood Public School', distanceKm: 0.4 },
      { name: 'Chatswood High School', distanceKm: 0.8 }
    ],
    transport: [
      { name: 'Chatswood Station', type: 'Train/Metro', distanceKm: 0.6 },
      { name: 'Bus Stop 123', type: 'Bus', distanceKm: 0.1 }
    ],
    emergencyServices: [
      { type: 'Bushfire Prone Land', riskLevel: 'Low' }
    ]
  },
  metadata: {
    createdDate: '2023-01-01',
    lastVerified: '2023-11-01',
    status: 'Active'
  },
  management: {
    managedBy: ManagedByType.REAL_ESTATE_AGENCY,
    managingAgencyName: 'Acme Realty',
    keyAccess: KeyAccessType.HELD_WITH_AGENT,
    ownerName: 'Jane Doe',
    ownerPhone: '0400 000 000'
  }
};

const MOCK_INSPECTION: Inspection = {
  id: 'INSP-OLD',
  propertyId: 'PROP-GUID-001',
  date: '2023-11-01T10:00:00Z',
  inspectorName: 'Sarah Jenkins',
  status: 'completed',
  summary: 'Routine inspection. Good condition.',
  items: [
    { id: '1', category: 'Room', name: 'Kitchen', rating: ConditionRating.GOOD, notes: 'Clean', photos: [] },
    { id: '2', category: 'Room', name: 'Bathroom', rating: ConditionRating.FAIR, notes: 'Grout discoloured', photos: [] }
  ]
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
  | { type: "UPDATE_PROPERTY"; payload: Property }
  | { type: "SET_ACTIVE_PROPERTY"; payload?: string }
  | { type: "ADD_REPORT"; payload: Inspection }
  | { type: "UPDATE_REPORT"; payload: Inspection }
  | { type: "DELETE_REPORT"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> };

const initialState: AppState = {
  properties: [MOCK_PROPERTY],
  reports: [MOCK_INSPECTION],
  activePropertyId: undefined,
  settings: { agencyName: "TruthKey Demo Agency", defaultInspectorName: "John Doe" },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "ADD_PROPERTY":
      return { ...state, properties: [...state.properties, action.payload] };

    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map(p => p.id === action.payload.id ? action.payload : p),
      };

    case "SET_ACTIVE_PROPERTY":
      return { ...state, activePropertyId: action.payload };

    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] };

    case "UPDATE_REPORT":
      return {
        ...state,
        reports: state.reports.map(r => r.id === action.payload.id ? action.payload : r),
      };

    case "DELETE_REPORT":
        return {
            ...state,
            reports: state.reports.filter(r => r.id !== action.payload)
        };

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

const STORAGE_KEY = "truthkey_platform_v1";

function safeParse(json: string | null): AppState | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate once
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
        dispatch({ type: "HYDRATE", payload: saved });
    }
    setIsHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (isHydrated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  if (!isHydrated) return null; // Or a loading spinner

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
