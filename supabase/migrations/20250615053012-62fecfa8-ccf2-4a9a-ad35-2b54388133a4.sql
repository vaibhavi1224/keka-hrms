
-- Create designations table
CREATE TABLE public.designations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  department_id uuid REFERENCES public.departments(id),
  level integer DEFAULT 1, -- For hierarchy levels (1=junior, 2=mid, 3=senior, etc.)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create workflows table for onboarding/offboarding process tracking
CREATE TABLE public.workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  workflow_type text NOT NULL CHECK (workflow_type IN ('onboarding', 'offboarding')),
  current_step integer DEFAULT 1,
  total_steps integer NOT NULL,
  step_data jsonb DEFAULT '{}', -- Store step-specific data
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  initiated_by uuid REFERENCES public.profiles(id) NOT NULL,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create workflow_steps table to define steps for each workflow type
CREATE TABLE public.workflow_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_type text NOT NULL CHECK (workflow_type IN ('onboarding', 'offboarding')),
  step_number integer NOT NULL,
  step_name text NOT NULL,
  step_description text,
  required_role text, -- Which role can complete this step
  is_required boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create org_structure table for manager-reportee relationships
CREATE TABLE public.org_structure (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  manager_id uuid REFERENCES public.profiles(id),
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employee_id, effective_from)
);

-- Create permissions table for fine-grained access control
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  resource text NOT NULL, -- e.g., 'employees', 'attendance', 'payroll'
  action text NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
  conditions jsonb DEFAULT '{}', -- Additional conditions like department-specific access
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add missing columns to profiles table for better employee management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation_id uuid REFERENCES public.designations(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reporting_manager_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'in_progress', 'completed'));

-- Enable RLS on new tables
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designations
CREATE POLICY "HR can manage all designations" ON public.designations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Everyone can view designations" ON public.designations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- RLS Policies for workflows
CREATE POLICY "HR can manage all workflows" ON public.workflows
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Employees can view their own workflows" ON public.workflows
FOR SELECT USING (
  employee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('hr', 'manager')
  )
);

-- RLS Policies for workflow_steps
CREATE POLICY "Everyone can view workflow steps" ON public.workflow_steps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "HR can manage workflow steps" ON public.workflow_steps
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

-- RLS Policies for org_structure
CREATE POLICY "HR can manage org structure" ON public.org_structure
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Everyone can view org structure" ON public.org_structure
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- RLS Policies for permissions
CREATE POLICY "HR can manage permissions" ON public.permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

CREATE POLICY "Everyone can view permissions" ON public.permissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER handle_designations_updated_at 
  BEFORE UPDATE ON public.designations 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_workflows_updated_at 
  BEFORE UPDATE ON public.workflows 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_org_structure_updated_at 
  BEFORE UPDATE ON public.org_structure 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert default workflow steps for onboarding
INSERT INTO public.workflow_steps (workflow_type, step_number, step_name, step_description, required_role) VALUES
('onboarding', 1, 'Profile Creation', 'Create basic employee profile with personal details', 'hr'),
('onboarding', 2, 'Department Assignment', 'Assign employee to department and designation', 'hr'),
('onboarding', 3, 'Manager Assignment', 'Assign reporting manager', 'hr'),
('onboarding', 4, 'Document Collection', 'Collect and verify necessary documents', 'hr'),
('onboarding', 5, 'System Access Setup', 'Create system accounts and access permissions', 'hr'),
('onboarding', 6, 'Welcome Email', 'Send welcome email with login credentials', 'hr'),
('onboarding', 7, 'Orientation Completion', 'Complete orientation and training', 'employee');

-- Insert default workflow steps for offboarding
INSERT INTO public.workflow_steps (workflow_type, step_number, step_name, step_description, required_role) VALUES
('offboarding', 1, 'Exit Interview', 'Conduct exit interview and collect feedback', 'hr'),
('offboarding', 2, 'Asset Collection', 'Collect company assets (laptop, ID card, etc.)', 'hr'),
('offboarding', 3, 'Knowledge Transfer', 'Complete knowledge transfer to team', 'manager'),
('offboarding', 4, 'Access Revocation', 'Revoke system access and permissions', 'hr'),
('offboarding', 5, 'Final Settlement', 'Process final salary and benefits settlement', 'hr'),
('offboarding', 6, 'Documentation', 'Complete offboarding documentation', 'hr');

-- Insert default permissions for different roles
INSERT INTO public.permissions (role, resource, action) VALUES
-- HR permissions (full access to everything)
('hr', 'employees', 'create'),
('hr', 'employees', 'read'),
('hr', 'employees', 'update'),
('hr', 'employees', 'delete'),
('hr', 'departments', 'create'),
('hr', 'departments', 'read'),
('hr', 'departments', 'update'),
('hr', 'departments', 'delete'),
('hr', 'designations', 'create'),
('hr', 'designations', 'read'),
('hr', 'designations', 'update'),
('hr', 'designations', 'delete'),
('hr', 'workflows', 'create'),
('hr', 'workflows', 'read'),
('hr', 'workflows', 'update'),
('hr', 'workflows', 'delete'),
('hr', 'org_structure', 'create'),
('hr', 'org_structure', 'read'),
('hr', 'org_structure', 'update'),
('hr', 'org_structure', 'delete'),

-- Manager permissions (limited to their team)
('manager', 'employees', 'read'),
('manager', 'employees', 'update'),
('manager', 'departments', 'read'),
('manager', 'designations', 'read'),
('manager', 'workflows', 'read'),
('manager', 'workflows', 'update'),
('manager', 'org_structure', 'read'),

-- Employee permissions (self-service only)
('employee', 'employees', 'read'),
('employee', 'employees', 'update'),
('employee', 'departments', 'read'),
('employee', 'designations', 'read'),
('employee', 'workflows', 'read'),
('employee', 'org_structure', 'read');

-- Insert some default designations
INSERT INTO public.designations (name, description, level) VALUES
('Intern', 'Entry level intern position', 1),
('Junior Developer', 'Junior software developer', 2),
('Senior Developer', 'Senior software developer', 3),
('Tech Lead', 'Technical team lead', 4),
('Engineering Manager', 'Engineering team manager', 5),
('Product Manager', 'Product management role', 4),
('HR Specialist', 'Human resources specialist', 3),
('HR Manager', 'Human resources manager', 4),
('Sales Representative', 'Sales team member', 2),
('Sales Manager', 'Sales team manager', 4);

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(resource text, action text, conditions jsonb)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT p.resource, p.action, p.conditions
  FROM public.permissions p
  JOIN public.profiles pr ON pr.role::text = p.role
  WHERE pr.id = user_uuid;
$$;

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid uuid, resource_name text, action_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.permissions p
    JOIN public.profiles pr ON pr.role::text = p.role
    WHERE pr.id = user_uuid 
    AND p.resource = resource_name 
    AND p.action = action_name
  );
$$;
