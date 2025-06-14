
-- Create biometric_credentials table for storing WebAuthn credentials
CREATE TABLE public.biometric_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for biometric_credentials
CREATE POLICY "Users can view their own biometric credentials" 
  ON public.biometric_credentials 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own biometric credentials" 
  ON public.biometric_credentials 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own biometric credentials" 
  ON public.biometric_credentials 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own biometric credentials" 
  ON public.biometric_credentials 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.biometric_credentials 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add columns to attendance table for biometric verification tracking
ALTER TABLE public.attendance 
ADD COLUMN biometric_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN biometric_verified_out BOOLEAN DEFAULT FALSE;
