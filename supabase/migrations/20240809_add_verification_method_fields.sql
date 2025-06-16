-- Migration: Add verification method fields to attendance table
-- This migration adds fields to track which verification method (biometric or geolocation) is used

-- Add verification method tracking fields if they don't exist
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'geolocation',
ADD COLUMN IF NOT EXISTS checkout_verification_method TEXT DEFAULT 'geolocation';

-- Create indexes if they don't exist 
CREATE INDEX IF NOT EXISTS idx_attendance_verification_method ON attendance (verification_method);
CREATE INDEX IF NOT EXISTS idx_attendance_checkout_verification_method ON attendance (checkout_verification_method);

-- Add comment to the columns
COMMENT ON COLUMN attendance.verification_method IS 'Method used for check-in verification: biometric or geolocation';
COMMENT ON COLUMN attendance.checkout_verification_method IS 'Method used for check-out verification: biometric or geolocation'; 