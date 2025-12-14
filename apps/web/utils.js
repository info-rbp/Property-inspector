export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // Remove the Data-URI prefix to get raw base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            }
            else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};
export const processImageFile = async (file) => {
    // Check MIME type or extension for HEIC/HEIF
    const name = file.name.toLowerCase();
    const isHeic = file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        name.endsWith('.heic') ||
        name.endsWith('.heif');
    if (isHeic) {
        if (typeof window.heic2any !== 'function') {
            console.warn('heic2any library not loaded. Skipping conversion.');
            return file;
        }
        try {
            // CRITICAL FIX: iPhone HEIC files often have missing or incorrect MIME types when read by the browser.
            // We must explicitly read the buffer and create a new Blob with 'image/heic' type
            // so that heic2any recognizes it correctly.
            const arrayBuffer = await file.arrayBuffer();
            const sourceBlob = new Blob([arrayBuffer], { type: 'image/heic' });
            const result = await window.heic2any({
                blob: sourceBlob,
                toType: 'image/jpeg',
                quality: 0.6 // Lowered from 0.8 to prevent memory issues with large files
            });
            const conversionBlob = Array.isArray(result) ? result[0] : result;
            // Create a new File object with the converted JPEG data
            const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            return new File([conversionBlob], newFileName, { type: 'image/jpeg', lastModified: Date.now() });
        }
        catch (error) {
            // Log specific error for debugging
            console.warn(`HEIC conversion failed for ${file.name}:`, error);
            // Return original file so it can still be attached (marked as "No Preview")
            // rather than failing the upload entirely.
            return file;
        }
    }
    // Return non-HEIC files as-is
    return file;
};
export const generateId = () => Math.random().toString(36).substr(2, 9);
export const getInitialItemsForRoom = (roomName) => {
    const lowerName = roomName.toLowerCase();
    const common = ['Floor coverings', 'Walls', 'Ceiling', 'Light fittings', 'Light switches', 'Power points', 'Windows/screens', 'Doors/frames'];
    if (lowerName.includes('kitchen')) {
        return [...common, 'Cupboards/drawers', 'Bench tops/tiling', 'Sink/taps', 'Stove top', 'Oven/griller', 'Exhaust fan'];
    }
    if (lowerName.includes('bath') || lowerName.includes('ensuite')) {
        return [...common, 'Shower/screen', 'Bath', 'Basin/taps', 'Mirror/cabinet', 'Toilet', 'Towel rails', 'Exhaust fan'];
    }
    if (lowerName.includes('laundry')) {
        return [...common, 'Washing tub', 'Washing machine taps', 'Tiling', 'Exhaust fan'];
    }
    if (lowerName.includes('exterior') || lowerName.includes('yard')) {
        return ['Lawn/edges', 'Gardens', 'Paving/driveways', 'Fencing/gates', 'Letterbox', 'Clothesline', 'Garage/carport'];
    }
    return [...common, 'Blinds/curtains', 'Skirting boards'];
};
