
-- Create goals_okrs table
CREATE TABLE public.goals_okrs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('OKR', 'KRA', 'Personal Goal')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weightage INTEGER NOT NULL DEFAULT 0 CHECK (weightage >= 0 AND weightage <= 100),
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review_cycles table
CREATE TABLE public.review_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('Monthly', 'Quarterly', 'Annual')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_reviews table
CREATE TABLE public.feedback_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_cycle_id UUID NOT NULL REFERENCES public.review_cycles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('self', 'peer', 'manager', 'hr')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_cycle_id, reviewer_id, reviewee_id, review_type)
);

-- Create appraisals table
CREATE TABLE public.appraisals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_cycle_id UUID NOT NULL REFERENCES public.review_cycles(id) ON DELETE CASCADE,
  final_rating NUMERIC(3,2) CHECK (final_rating >= 1.0 AND final_rating <= 5.0),
  remarks TEXT,
  promotion_eligible BOOLEAN DEFAULT false,
  salary_increment NUMERIC(10,2),
  decided_by UUID REFERENCES public.profiles(id),
  decided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, review_cycle_id)
);

-- Add indexes for better performance
CREATE INDEX idx_goals_okrs_employee_id ON public.goals_okrs(employee_id);
CREATE INDEX idx_goals_okrs_created_by ON public.goals_okrs(created_by);
CREATE INDEX idx_goals_okrs_status ON public.goals_okrs(status);

CREATE INDEX idx_review_cycles_status ON public.review_cycles(status);
CREATE INDEX idx_review_cycles_created_by ON public.review_cycles(created_by);

CREATE INDEX idx_feedback_reviews_cycle_id ON public.feedback_reviews(review_cycle_id);
CREATE INDEX idx_feedback_reviews_reviewer_id ON public.feedback_reviews(reviewer_id);
CREATE INDEX idx_feedback_reviews_reviewee_id ON public.feedback_reviews(reviewee_id);

CREATE INDEX idx_appraisals_employee_id ON public.appraisals(employee_id);
CREATE INDEX idx_appraisals_cycle_id ON public.appraisals(review_cycle_id);
CREATE INDEX idx_appraisals_decided_by ON public.appraisals(decided_by);

-- Enable Row Level Security
ALTER TABLE public.goals_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals_okrs
CREATE POLICY "Employees can view their own goals" 
  ON public.goals_okrs 
  FOR SELECT 
  USING (employee_id = auth.uid() OR created_by = auth.uid() OR public.is_manager_or_hr(auth.uid()));

CREATE POLICY "HR and managers can create goals" 
  ON public.goals_okrs 
  FOR INSERT 
  WITH CHECK (public.is_manager_or_hr(auth.uid()));

CREATE POLICY "HR and goal creators can update goals" 
  ON public.goals_okrs 
  FOR UPDATE 
  USING (created_by = auth.uid() OR public.is_hr(auth.uid()));

CREATE POLICY "HR can delete goals" 
  ON public.goals_okrs 
  FOR DELETE 
  USING (public.is_hr(auth.uid()));

-- RLS Policies for review_cycles
CREATE POLICY "Anyone can view active review cycles" 
  ON public.review_cycles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only HR can manage review cycles" 
  ON public.review_cycles 
  FOR ALL 
  USING (public.is_hr(auth.uid()));

-- RLS Policies for feedback_reviews
CREATE POLICY "Users can view feedback where they are reviewer or reviewee" 
  ON public.feedback_reviews 
  FOR SELECT 
  USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid() OR public.is_manager_or_hr(auth.uid()));

CREATE POLICY "Users can submit their own feedback" 
  ON public.feedback_reviews 
  FOR INSERT 
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own feedback before cycle ends" 
  ON public.feedback_reviews 
  FOR UPDATE 
  USING (reviewer_id = auth.uid());

-- RLS Policies for appraisals
CREATE POLICY "Employees can view their own appraisals" 
  ON public.appraisals 
  FOR SELECT 
  USING (employee_id = auth.uid() OR public.is_manager_or_hr(auth.uid()));

CREATE POLICY "Only HR and managers can create/update appraisals" 
  ON public.appraisals 
  FOR ALL 
  USING (public.is_manager_or_hr(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_goals_okrs BEFORE UPDATE ON public.goals_okrs FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_review_cycles BEFORE UPDATE ON public.review_cycles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_feedback_reviews BEFORE UPDATE ON public.feedback_reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_appraisals BEFORE UPDATE ON public.appraisals FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to calculate final appraisal rating
CREATE OR REPLACE FUNCTION public.calculate_final_rating(
  p_employee_id UUID,
  p_review_cycle_id UUID
) 
RETURNS NUMERIC AS $$
DECLARE
  self_rating NUMERIC;
  peer_avg NUMERIC;
  manager_rating NUMERIC;
  hr_rating NUMERIC;
  final_rating NUMERIC;
BEGIN
  -- Get self rating
  SELECT rating INTO self_rating 
  FROM public.feedback_reviews 
  WHERE reviewee_id = p_employee_id 
    AND review_cycle_id = p_review_cycle_id 
    AND review_type = 'self'
  LIMIT 1;
  
  -- Get average peer rating
  SELECT AVG(rating) INTO peer_avg 
  FROM public.feedback_reviews 
  WHERE reviewee_id = p_employee_id 
    AND review_cycle_id = p_review_cycle_id 
    AND review_type = 'peer';
  
  -- Get manager rating
  SELECT rating INTO manager_rating 
  FROM public.feedback_reviews 
  WHERE reviewee_id = p_employee_id 
    AND review_cycle_id = p_review_cycle_id 
    AND review_type = 'manager'
  LIMIT 1;
  
  -- Get HR rating
  SELECT rating INTO hr_rating 
  FROM public.feedback_reviews 
  WHERE reviewee_id = p_employee_id 
    AND review_cycle_id = p_review_cycle_id 
    AND review_type = 'hr'
  LIMIT 1;
  
  -- Calculate weighted average (Manager: 40%, Self: 20%, Peer: 25%, HR: 15%)
  final_rating := (
    COALESCE(manager_rating, 0) * 0.4 +
    COALESCE(self_rating, 0) * 0.2 +
    COALESCE(peer_avg, 0) * 0.25 +
    COALESCE(hr_rating, 0) * 0.15
  );
  
  RETURN ROUND(final_rating, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
