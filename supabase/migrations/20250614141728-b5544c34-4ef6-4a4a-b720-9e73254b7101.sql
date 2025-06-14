
-- Add invitation-related columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'email';

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  department TEXT,
  designation TEXT,
  date_of_joining DATE,
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'INVITED',
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations table
CREATE POLICY "HR can view all invitations" ON public.invitations
  FOR SELECT USING (public.is_hr(auth.uid()));

CREATE POLICY "HR can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (public.is_hr(auth.uid()));

CREATE POLICY "HR can update invitations" ON public.invitations
  FOR UPDATE USING (public.is_hr(auth.uid()));

-- Add updated_at trigger to invitations
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle Google OAuth user creation from invitation
CREATE OR REPLACE FUNCTION public.handle_google_oauth_signup()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record public.invitations%ROWTYPE;
BEGIN
  -- Check if there's a pending invitation for this email
  SELECT * INTO invitation_record 
  FROM public.invitations 
  WHERE email = NEW.email 
    AND status = 'INVITED' 
    AND expires_at > NOW();

  IF FOUND THEN
    -- Create profile from invitation data
    INSERT INTO public.profiles (
      id, email, first_name, last_name, role, department, designation, 
      date_of_joining, status, invited_by, invited_at, auth_method
    ) VALUES (
      NEW.id,
      NEW.email,
      SPLIT_PART(invitation_record.name, ' ', 1),
      CASE 
        WHEN array_length(string_to_array(invitation_record.name, ' '), 1) > 1 
        THEN SPLIT_PART(invitation_record.name, ' ', 2)
        ELSE ''
      END,
      invitation_record.role,
      invitation_record.department,
      invitation_record.designation,
      invitation_record.date_of_joining,
      'ACTIVE',
      invitation_record.invited_by,
      invitation_record.invited_at,
      'google'
    );

    -- Create employee record if salary was specified
    IF invitation_record.salary IS NOT NULL THEN
      INSERT INTO public.employees (profile_id, salary)
      VALUES (NEW.id, invitation_record.salary);
    END IF;

    -- Mark invitation as accepted
    UPDATE public.invitations 
    SET status = 'ACCEPTED', updated_at = NOW()
    WHERE id = invitation_record.id;
  ELSE
    -- No invitation found, create basic profile
    INSERT INTO public.profiles (id, email, first_name, last_name, auth_method)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      'google'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_google_oauth_signup();
