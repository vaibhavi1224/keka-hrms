
-- Create notifications table for real-time notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hr_documents table for document management
CREATE TABLE public.hr_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  employee_id UUID REFERENCES auth.users(id),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for HR documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hr-documents', 'hr-documents', true);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications (users can only see their own)
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- HR can create notifications for any user
CREATE POLICY "HR can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Enable RLS for hr_documents
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hr_documents (all authenticated users can view)
CREATE POLICY "Authenticated users can view hr_documents" 
  ON public.hr_documents 
  FOR SELECT 
  TO authenticated
  USING (true);

-- HR can manage all documents
CREATE POLICY "HR can manage hr_documents" 
  ON public.hr_documents 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Create storage policies for hr-documents bucket
CREATE POLICY "Anyone can view hr documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'hr-documents');

CREATE POLICY "HR can upload hr documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'hr-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "HR can update hr documents" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'hr-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "HR can delete hr documents" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'hr-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add updated_at trigger for notifications
CREATE TRIGGER handle_updated_at_notifications
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add updated_at trigger for hr_documents
CREATE TRIGGER handle_updated_at_hr_documents
  BEFORE UPDATE ON public.hr_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
