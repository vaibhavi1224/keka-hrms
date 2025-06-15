
-- Create table for storing extracted resume data
CREATE TABLE public.resume_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  extracted_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate resume data per employee
ALTER TABLE public.resume_data 
ADD CONSTRAINT unique_employee_resume_data UNIQUE (employee_id);

-- Add RLS policies
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

-- HR can view all resume data
CREATE POLICY "HR can view all resume data" ON public.resume_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- HR can update resume data status
CREATE POLICY "HR can update resume data" ON public.resume_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Employees can only view their own resume data
CREATE POLICY "Employees can view own resume data" ON public.resume_data
  FOR SELECT USING (employee_id = auth.uid());

-- System can insert resume data (for edge function)
CREATE POLICY "System can insert resume data" ON public.resume_data
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for documents (resumes, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Create storage policies for documents bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "HR can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_resume_data
  BEFORE UPDATE ON public.resume_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
