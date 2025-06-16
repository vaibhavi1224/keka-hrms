-- Migration: Add Mumbai office location
-- This migration adds a new office location for Mumbai

-- Insert the Mumbai office location (if it doesn't already exist)
INSERT INTO office_locations (name, latitude, longitude, radius_meters, address, is_active)
SELECT 'Mumbai Office', 19.219881648738657, 72.9779857496088, 1000, 'Mumbai Office Location', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM office_locations 
    WHERE latitude = 19.219881648738657 
    AND longitude = 72.9779857496088
); 