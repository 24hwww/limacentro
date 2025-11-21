import { Coordinates } from '../types';

/**
 * Geocodes an address restricted to Lima, Peru using OpenStreetMap's Nominatim API.
 * 
 * @param address The street address (e.g., "Av. Larco 1348")
 * @param district The district (e.g., "Miraflores")
 * @returns Promise<Coordinates | null>
 */
export const geocodeAddress = async (address: string, district: string): Promise<Coordinates | null> => {
  try {
    // Construct the query specifically for Lima, Peru
    const query = `${address}, ${district}, Lima, Peru`;
    const encodedQuery = encodeURIComponent(query);
    
    // Using Nominatim API
    // IMPORTANT: In production, you must respect usage policy (User-Agent) and rate limits (1 request/sec).
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es', // Prefer Spanish results
      }
    });

    if (!response.ok) {
      throw new Error("Geocoding service failed");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
