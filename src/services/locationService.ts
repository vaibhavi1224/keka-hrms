import { supabase } from '@/integrations/supabase/client';
import { PositionData, calculateDistance } from '@/utils/geolocation';
import { OfficeLocation } from '@/integrations/supabase/types';

/**
 * Fetch all office locations from the database
 */
export const fetchOfficeLocations = async (activeOnly: boolean = false): Promise<OfficeLocation[]> => {
  try {
    let query = supabase
      .from('office_locations')
      .select('*')
      .order('name');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching office locations:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchOfficeLocations:', error);
    throw error;
  }
};

/**
 * Check if a position is within any allowed office location
 */
export const checkPositionAtOffice = async (position: PositionData): Promise<{
  isValid: boolean;
  officeName: string | null;
  officeId: string | null;
  distance?: number;
}> => {
  try {
    // Get active office locations
    const officeLocations = await fetchOfficeLocations(true);
    
    // Default result
    let result = {
      isValid: false,
      officeName: null,
      officeId: null,
      distance: undefined
    };
    
    if (!officeLocations.length) {
      return result;
    }
    
    // Check each location
    for (const office of officeLocations) {
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        office.latitude,
        office.longitude
      );
      
      // If within radius, validate
      if (distance <= office.radius_meters) {
        result = {
          isValid: true,
          officeName: office.name,
          officeId: office.id,
          distance
        };
        break;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error checking office location:', error);
    throw error;
  }
};

/**
 * Add a new office location
 */
export const addOfficeLocation = async (location: {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address?: string;
}): Promise<OfficeLocation> => {
  try {
    const { data, error } = await supabase
      .from('office_locations')
      .insert({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        radius_meters: location.radius_meters,
        address: location.address,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding office location:', error);
    throw error;
  }
};

/**
 * Update an existing office location
 */
export const updateOfficeLocation = async (
  id: string,
  updates: {
    name?: string;
    latitude?: number;
    longitude?: number;
    radius_meters?: number;
    address?: string;
    is_active?: boolean;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('office_locations')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating office location:', error);
    throw error;
  }
};

/**
 * Delete an office location
 */
export const deleteOfficeLocation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('office_locations')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting office location:', error);
    throw error;
  }
};

/**
 * Store attendance location information
 */
export const recordAttendanceLocation = async (
  attendanceId: string,
  locationInfo: {
    latitude: number;
    longitude: number;
    location_verified: boolean;
    location_name?: string;
  },
  isCheckout: boolean = false
): Promise<void> => {
  try {
    const updates = isCheckout ? {
      checkout_latitude: locationInfo.latitude,
      checkout_longitude: locationInfo.longitude,
      checkout_location_verified: locationInfo.location_verified,
      checkout_location_name: locationInfo.location_name
    } : {
      latitude: locationInfo.latitude,
      longitude: locationInfo.longitude,
      location_verified: locationInfo.location_verified,
      location_name: locationInfo.location_name
    };
    
    const { error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', attendanceId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error recording attendance location:', error);
    throw error;
  }
}; 