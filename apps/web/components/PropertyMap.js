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
exports.PropertyMap = void 0;
const react_2 = __importStar(require("react"));
const googleMapsLoader_1 = require("../services/googleMapsLoader");
const PropertyMap = ({ lat, lng, title }) => {
    const mapRef = (0, react_2.useRef)(null);
    const [error, setError] = (0, react_2.useState)(null);
    const [isLoading, setIsLoading] = (0, react_2.useState)(true);
    // Robust check for valid coordinates
    const isValidLocation = typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat !== 0 &&
        lng !== 0;
    (0, react_2.useEffect)(() => {
        if (!isValidLocation) {
            setIsLoading(false);
            return;
        }
        let isMounted = true;
        const initMap = async () => {
            try {
                await (0, googleMapsLoader_1.loadGoogleMapsApi)();
                if (!isMounted)
                    return;
                if (!mapRef.current)
                    return;
                if (!window.google?.maps) {
                    setError("Map API not loaded");
                    setIsLoading(false);
                    return;
                }
                const map = new window.google.maps.Map(mapRef.current, {
                    center: { lat, lng },
                    zoom: 18,
                    mapId: "PROPERTY_MAP", // Recommended for newer vector maps, falls back gracefully
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: false,
                    fullscreenControl: true,
                });
                new window.google.maps.Marker({
                    position: { lat, lng },
                    map,
                    title: title || "Property Location",
                    animation: window.google.maps.Animation.DROP,
                });
                setIsLoading(false);
            }
            catch (e) {
                if (isMounted) {
                    // Suppress the specific API Key missing error from the console
                    if (e?.message !== "API Key missing") {
                        console.error("Map init failed", e);
                    }
                    setError("Could not load map");
                    setIsLoading(false);
                }
            }
        };
        initMap();
        return () => { isMounted = false; };
    }, [lat, lng, title, isValidLocation]);
    if (!isValidLocation) {
        return (<div className="w-full h-full min-h-[300px] bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400">
              <span className="text-2xl mb-2">🗺️</span>
              <span className="text-sm">Location data unavailable</span>
          </div>);
    }
    if (error) {
        return (<div className="w-full h-full min-h-[300px] bg-slate-50 rounded-lg flex items-center justify-center text-red-400 border border-slate-200">
              <span className="text-sm font-medium">{error}</span>
          </div>);
    }
    return (<div className="w-full h-full min-h-[300px] relative rounded-lg overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapRef} className="w-full h-full"/>
        {isLoading && (<div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>)}
    </div>);
};
exports.PropertyMap = PropertyMap;
