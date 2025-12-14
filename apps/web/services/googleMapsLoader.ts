import { getGoogleMapsApiKey } from './apiKeys';

let loaderPromise: Promise<void> | null = null;

export const loadGoogleMapsApi = (): Promise<void> => {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    // If the API is already loaded globally
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      resolve();
      return;
    }

    const rawKey = getGoogleMapsApiKey();
    const apiKey = rawKey ? rawKey.trim() : "";
    
    if (!apiKey) {
      // Don't reject immediately to allow the app to function without Maps if needed,
      // but warn heavily.
      console.warn("Google Maps API Key missing. Maps features will not work.");
      // We reject here because callers expect the API to be usable after this promise resolves.
      reject(new Error("API Key missing"));
      return;
    }

    const script = document.createElement('script');
    // Load 'places' library for Autocomplete and 'marker' for the Map
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
        console.info("Google Maps JS loaded. Places available:", !!(window as any).google?.maps?.places);
        resolve();
    };
    script.onerror = (e) => {
        console.error("Google Maps Script Load Error", e);
        loaderPromise = null; // Allow retry
        reject(e);
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
};