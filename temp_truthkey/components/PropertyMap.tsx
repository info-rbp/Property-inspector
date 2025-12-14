import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../services/googleMapsLoader';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ lat, lng, title }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Robust check for valid coordinates
  const isValidLocation = 
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    lat !== 0 && 
    lng !== 0;

  useEffect(() => {
    if (!isValidLocation) {
        setIsLoading(false);
        return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        await loadGoogleMapsApi();
        
        if (!isMounted) return;
        if (!mapRef.current) return;
        
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
      } catch (e: any) {
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
      return (
          <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400">
              <span className="text-2xl mb-2">🗺️</span>
              <span className="text-sm">Location data unavailable</span>
          </div>
      );
  }

  if (error) {
      return (
          <div className="w-full h-full min-h-[300px] bg-slate-50 rounded-lg flex items-center justify-center text-red-400 border border-slate-200">
              <span className="text-sm font-medium">{error}</span>
          </div>
      );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-lg overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapRef} className="w-full h-full" />
        {isLoading && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )}
    </div>
  );
};