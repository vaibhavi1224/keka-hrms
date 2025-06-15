
-- Create performance_metrics table to store various performance indicators
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  metric_type TEXT NOT NULL, -- 'tasks_completed', 'attendance_rate', 'training_progress', 'goal_achievement', etc.
  metric_value NUMERIC NOT NULL,
  target_value NUMERIC,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quarter INTEGER NOT NULL, -- 1-4
  year INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create performance_feedback table for NLP analysis
CREATE TABLE public.performance_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  feedback_type TEXT NOT NULL, -- 'self_review', 'manager_review', 'peer_review', '360_feedback'
  feedback_text TEXT NOT NULL,
  rating NUMERIC CHECK (rating >= 1 AND rating <= 5),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create performance_insights table to store AI-generated insights
CREATE TABLE public.performance_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  insight_type TEXT NOT NULL, -- 'trend_analysis', 'improvement_suggestion', 'strength_highlight'
  insight_title TEXT NOT NULL,
  insight_summary TEXT NOT NULL,
  supporting_data JSONB, -- Store trend data, metrics, etc.
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add RLS policies
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_insights ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies
CREATE POLICY "Users can view their own performance metrics" 
  ON public.performance_metrics FOR SELECT 
  USING (
    employee_id = auth.uid() OR 
    auth.uid() IN (
      SELECT manager_id FROM public.profiles WHERE id = performance_metrics.employee_id AND manager_id IS NOT NULL
    ) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Managers and HR can insert performance metrics" 
  ON public.performance_metrics FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'hr')));

-- Performance feedback policies
CREATE POLICY "Users can view relevant feedback" 
  ON public.performance_feedback FOR SELECT 
  USING (
    employee_id = auth.uid() OR 
    created_by = auth.uid() OR 
    auth.uid() IN (
      SELECT manager_id FROM public.profiles WHERE id = performance_feedback.employee_id AND manager_id IS NOT NULL
    ) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

CREATE POLICY "Users can create feedback" 
  ON public.performance_feedback FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Performance insights policies
CREATE POLICY "Users can view their own insights" 
  ON public.performance_insights FOR SELECT 
  USING (
    employee_id = auth.uid() OR 
    auth.uid() IN (
      SELECT manager_id FROM public.profiles WHERE id = performance_insights.employee_id AND manager_id IS NOT NULL
    ) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr')
  );

-- Create indexes for better performance
CREATE INDEX idx_performance_metrics_employee_date ON public.performance_metrics(employee_id, measurement_date);
CREATE INDEX idx_performance_feedback_employee ON public.performance_feedback(employee_id);
CREATE INDEX idx_performance_insights_employee ON public.performance_insights(employee_id, generated_at);
