
-- Add onboarding_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending';
