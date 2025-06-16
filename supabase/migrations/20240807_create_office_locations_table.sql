-- Migration: Create office_locations table
-- This migration adds a new table for storing allowed office locations for attendance verification

-- Create the table for office locations
CREATE TABLE IF NOT EXISTS office_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for the table
COMMENT ON TABLE office_locations IS 'Stores office locations where employees can check in/out for attendance';

-- Create indexes for faster queries
CREATE INDEX idx_office_locations_is_active ON office_locations(is_active);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_office_locations()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_office_locations_timestamp
BEFORE UPDATE ON office_locations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_office_locations();

-- Insert a default office location
INSERT INTO office_locations (name, latitude, longitude, radius_meters, address, is_active)
VALUES ('Main Office', 19.219881648738657, 72.9779857496088, 1000, 'Mumbai Office Location', TRUE);

-- Grant appropriate permissions
ALTER TABLE office_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for row-level security
CREATE POLICY "Allow HR admins to manage office_locations"
  ON office_locations
  USING (true)
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'hr');

CREATE POLICY "Allow viewing office_locations for all authenticated users"
  ON office_locations
  FOR SELECT
  USING ((SELECT auth.role() = 'authenticated'));

-- Add this table to Supabase types
DO $$ 
BEGIN
    -- Add the table to allowed tables for anon and service_role keys if needed
    GRANT SELECT ON office_locations TO anon;
    GRANT ALL ON office_locations TO service_role;
END
$$; 