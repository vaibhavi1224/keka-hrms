
-- Create attrition_predictions table to store AI predictions
CREATE TABLE public.attrition_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  attrition_risk NUMERIC NOT NULL CHECK (attrition_risk >= 0 AND attrition_risk <= 1),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  predicted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  model_version TEXT DEFAULT 'xeroISB/EmployeeSurvivalRate',
  confidence_score NUMERIC,
  risk_factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.attrition_predictions ENABLE ROW LEVEL SECURITY;

-- HR can view all predictions
CREATE POLICY "HR can view all attrition predictions" 
  ON public.attrition_predictions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

-- HR can insert predictions
CREATE POLICY "HR can create attrition predictions" 
  ON public.attrition_predictions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

-- HR can update predictions
CREATE POLICY "HR can update attrition predictions" 
  ON public.attrition_predictions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

-- Create indexes for better performance
CREATE INDEX idx_attrition_predictions_employee ON public.attrition_predictions(employee_id);
CREATE INDEX idx_attrition_predictions_risk_level ON public.attrition_predictions(risk_level);
CREATE INDEX idx_attrition_predictions_predicted_at ON public.attrition_predictions(predicted_at);

-- Add trigger for updated_at
CREATE TRIGGER update_attrition_predictions_updated_at
  BEFORE UPDATE ON public.attrition_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
