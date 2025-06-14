
-- Create departments table
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  manager_id uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create documents table for employee document storage
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  document_name text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create offboarding_logs table
CREATE TABLE public.offboarding_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  last_working_date date,
  exit_reason text,
  feedback text,
  processed_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours_start time;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours_end time;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_working_date date;

-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "HR can manage all departments" ON public.departments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Managers and employees can view departments" ON public.departments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('manager', 'employee')
  )
);

-- RLS Policies for documents
CREATE POLICY "HR can manage all documents" ON public.documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Employees can view their own documents" ON public.documents
FOR SELECT USING (
  employee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('hr', 'manager')
  )
);

-- RLS Policies for offboarding_logs
CREATE POLICY "HR can manage all offboarding logs" ON public.offboarding_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

-- Storage policies for employee documents
CREATE POLICY "HR can upload employee documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'employee-documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "HR can view all employee documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'employee-documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Employees can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'employee-documents' AND
  (storage.filename(name))::text LIKE (auth.uid()::text || '%')
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_departments_updated_at 
  BEFORE UPDATE ON public.departments 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert some default departments
INSERT INTO public.departments (name, description) VALUES
('Engineering', 'Software development and technical teams'),
('Sales', 'Sales and business development'),
('Marketing', 'Marketing and brand management'),
('Human Resources', 'HR and people operations'),
('Finance', 'Finance and accounting'),
('Operations', 'Operations and support')
ON CONFLICT (name) DO NOTHING;
