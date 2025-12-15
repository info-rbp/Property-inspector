"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddress = exports.getAddressSuggestions = void 0;
const googleMapsLoader_1 = require("./googleMapsLoader");
const getAddressSuggestions = async (query) => {
    if (!query || query.length < 3)
        return [];
    try {
        await (0, googleMapsLoader_1.loadGoogleMapsApi)();
        return new Promise((resolve) => {
            if (!window.google?.maps?.places) {
                // Quietly resolve empty if Places lib isn't available
                resolve([]);
                return;
            }
            const service = new window.google.maps.places.AutocompleteService();
            service.getPlacePredictions({
                input: query,
                componentRestrictions: { country: 'au' }, // Restrict to Australia
                types: ['address'] // Focus on precise addresses
            }, (predictions, status) => {
                if (status !== window.google.maps.places.PlacesServiceStatus.OK ||
                    !predictions) {
                    resolve([]);
                    return;
                }
                const results = predictions.map((p) => ({
                    place_id: p.place_id,
                    display_name: p.description,
                }));
                resolve(results);
            });
        });
    }
    catch (error) {
        // Suppress "API Key missing" noise
        if (error?.message !== "API Key missing") {
            console.error("Error fetching address suggestions:", error);
        }
        return [];
    }
};
exports.getAddressSuggestions = getAddressSuggestions;
const validateAddress = async (query) => {
    try {
        await (0, googleMapsLoader_1.loadGoogleMapsApi)();
        return new Promise((resolve) => {
            if (!window.google?.maps?.Geocoder) {
                resolve(null);
                return;
            }
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: query, componentRestrictions: { country: 'AU' } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const res = results[0];
                    // Helper to extract component
                    const getComponent = (type) => {
                        const c = res.address_components.find((comp) => comp.types.includes(type));
                        return c ? c.long_name : '';
                    };
                    const streetNumber = getComponent('street_number');
                    const route = getComponent('route');
                    const suburb = getComponent('locality');
                    const state = getComponent('administrative_area_level_1');
                    const postcode = getComponent('postal_code');
                    // In Australia, LGA (Council) is typically administrative_area_level_2
                    const councilArea = getComponent('administrative_area_level_2');
                    resolve({
                        formattedAddress: res.formatted_address,
                        placeId: res.place_id,
                        location: {
                            lat: res.geometry.location.lat(),
                            lng: res.geometry.location.lng()
                        },
                        streetNumber,
                        streetName: route,
                        suburb,
                        state,
                        postcode,
                        councilArea
                    });
                }
                else {
                    // Don't warn on console for generic no-results, just resolve null
                    resolve(null);
                }
            });
        });
    }
    catch (error) {
        if (error?.message !== "API Key missing") {
            console.error("Geocoding error:", error);
        }
        return null;
    }
};
exports.validateAddress = validateAddress;
