-- Migration: Add location fields to attendance table
-- This migration adds geolocation tracking and verification fields to the attendance table

-- Add check-in location fields
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Add check-out location fields
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS checkout_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS checkout_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS checkout_location_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checkout_location_name TEXT;

-- Add verification method tracking fields
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'geolocation',
ADD COLUMN IF NOT EXISTS checkout_verification_method TEXT DEFAULT 'geolocation';

-- Add indexes for faster queries on location fields
CREATE INDEX IF NOT EXISTS idx_attendance_location_verified ON attendance (location_verified);
CREATE INDEX IF NOT EXISTS idx_attendance_checkout_location_verified ON attendance (checkout_location_verified);
CREATE INDEX IF NOT EXISTS idx_attendance_verification_method ON attendance (verification_method); 
