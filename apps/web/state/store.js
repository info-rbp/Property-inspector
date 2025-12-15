"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProvider = StoreProvider;
exports.useStore = useStore;
const react_2 = __importStar(require("react"));
const utils_1 = require("../utils");
// --- MOCK DATA FOR INITIAL HYDRATION ---
const MOCK_PROPERTY = {
    id: 'prop-1',
    address: '24 Nightingale Lane, Chatswood NSW 2067',
    ownerName: 'Jane Doe',
    tenantName: 'John Smith',
    tenantEmail: 'john.smith@example.com',
    defaultRooms: ['Kitchen', 'Bathroom', 'Bedroom 1', 'Living Room'],
    thumbnailUrl: `https://source.unsplash.com/random/800x600?house,${Math.random()}`
};
const MOCK_ROOMS = [
    {
        id: (0, utils_1.generateId)(),
        name: 'Kitchen',
        items: [],
        photos: [],
        overallComment: 'Clean and tidy'
    },
    {
        id: (0, utils_1.generateId)(),
        name: 'Bathroom',
        items: [],
        photos: [],
        overallComment: 'Grout discoloured'
    }
];
const MOCK_INSPECTION = {
    id: 'insp-1',
    propertyId: 'prop-1',
    date: '2023-11-01T10:00:00Z',
    inspectorName: 'Sarah Jenkins',
    status: 'completed',
    summary: 'Routine inspection. Good condition.',
    rooms: MOCK_ROOMS
};
const initialState = {
    properties: [MOCK_PROPERTY],
    reports: [MOCK_INSPECTION],
    activePropertyId: undefined,
    settings: { agencyName: "ProInspect Demo", defaultInspectorName: "John Doe" },
};
function reducer(state, action) {
    switch (action.type) {
        case "HYDRATE":
            return { ...action.payload, properties: action.payload.properties || [], reports: action.payload.reports || [] };
        case "ADD_PROPERTY":
            return { ...state, properties: [...state.properties, action.payload] };
        case "UPDATE_PROPERTY":
            return {
                ...state,
                properties: state.properties.map(p => p.id === action.payload.id ? { ...p, ...action.payload.updates } : p),
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
const StoreCtx = (0, react_2.createContext)(null);
const STORAGE_KEY = "proinspect_platform_v2";
function safeParse(json) {
    if (!json)
        return null;
    try {
        const parsed = JSON.parse(json);
        // Basic shape validation
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.properties) && Array.isArray(parsed.reports)) {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
}
function StoreProvider({ children }) {
    const [state, dispatch] = (0, react_2.useReducer)(reducer, initialState);
    const [isHydrated, setIsHydrated] = react_2.default.useState(false);
    (0, react_2.useEffect)(() => {
        const saved = safeParse(localStorage.getItem(STORAGE_KEY));
        if (saved) {
            dispatch({ type: "HYDRATE", payload: saved });
        }
        setIsHydrated(true);
    }, []);
    (0, react_2.useEffect)(() => {
        if (isHydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isHydrated]);
    const value = (0, react_2.useMemo)(() => ({ state, dispatch }), [state]);
    if (!isHydrated)
        return null;
    return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
function useStore() {
    const ctx = (0, react_2.useContext)(StoreCtx);
    if (!ctx)
        throw new Error("useStore must be used within StoreProvider");
    return ctx;
}
