/**
 * Geolocation utilities for attendance and location verification
 */

import { fetchOfficeLocations, checkPositionAtOffice } from '@/services/locationService';

// Fallback office location in case database lookup fails
const FALLBACK_OFFICE_LOCATIONS = [
  {
    name: "Mumbai Office",
    latitude: 19.219881648738657,
    longitude: 72.9779857496088,
    radiusInMeters: 1000 // 1km radius
  }
];

// Type for position data
export interface PositionData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

/**
 * Calculate distance between two coordinates in meters
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
};

/**
 * Check if a position is within any allowed office location
 * Note: This now uses an async API call, but we keep this function for backward compatibility
 */
export const isPositionAtOffice = async (position: PositionData): Promise<{isValid: boolean, officeName: string | null}> => {
  try {
    const result = await checkPositionAtOffice(position);
    return {
      isValid: result.isValid,
      officeName: result.officeName
    };
  } catch (error) {
    console.error("Error checking position against office locations:", error);
    
    // Fallback to hardcoded locations if database lookup fails
    for (const office of FALLBACK_OFFICE_LOCATIONS) {
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        office.latitude,
        office.longitude
      );
      
      if (distance <= office.radiusInMeters) {
        return {
          isValid: true,
          officeName: office.name
        };
      }
    }
    
    return {
      isValid: false,
      officeName: null
    };
  }
};

/**
 * Get current position with promise-based API
 */
export const getCurrentPosition = (): Promise<PositionData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  });
};

/**
 * Try to get address from coordinates using Reverse Geocoding API
 */
export const getAddressFromCoordinates = async (position: PositionData): Promise<string> => {
  try {
    // Using Nominatim OpenStreetMap API (for demonstration - consider limits for production use)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.latitude}&lon=${position.longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HRMS Application' // Required by the API
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    return data.display_name || 'Address not found';
  } catch (error) {
    console.error('Error getting address:', error);
    return `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
  }
}; 