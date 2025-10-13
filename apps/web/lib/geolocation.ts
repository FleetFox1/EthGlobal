// Geolocation utility for getting user's state from browser
// Prepares for future ZKgeo integration for privacy-preserving location proofs

export interface LocationData {
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get user's current location using browser Geolocation API
 * Returns coordinates that can be used to determine state
 */
export async function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject({
        code: error.code,
        message: getGeolocationErrorMessage(error.code),
      }),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Convert geolocation error code to user-friendly message
 */
function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location permission denied. Please enable location access to submit bugs.';
    case 2:
      return 'Location unavailable. Please check your device settings.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to get location. Please try again.';
  }
}

/**
 * Get US state from coordinates using reverse geocoding
 * For now, uses a simple lookup. Will be replaced with ZKgeo for privacy.
 * 
 * TODO: Replace with ZKgeo for zero-knowledge location proofs
 */
export async function getStateFromCoordinates(
  latitude: number,
  longitude: number
): Promise<LocationData> {
  try {
    // Using Nominatim (OpenStreetMap) for reverse geocoding
    // Free tier, no API key needed
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BugDex/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    // Extract state from address components
    const state = data.address?.state || data.address?.county || 'Unknown';
    const country = data.address?.country || 'Unknown';

    return {
      state,
      country,
      latitude,
      longitude,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Fallback: Return coordinates without state name
    return {
      state: 'Unknown',
      country: 'Unknown',
      latitude,
      longitude,
      timestamp: Date.now(),
    };
  }
}

/**
 * Get user's state with permission handling
 * Main function to use in components
 */
export async function getUserLocation(): Promise<LocationData> {
  const position = await getCurrentLocation();
  const locationData = await getStateFromCoordinates(
    position.coords.latitude,
    position.coords.longitude
  );
  
  return locationData;
}

/**
 * Check if geolocation is supported and permission is granted
 */
export async function checkGeolocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'prompt';
  }
}
