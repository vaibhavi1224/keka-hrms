
-- Create a function to get attrition predictions with employee profiles
CREATE OR REPLACE FUNCTION get_attrition_predictions_with_profiles()
RETURNS TABLE (
  employee_id UUID,
  attrition_risk NUMERIC,
  risk_level TEXT,
  predicted_at TIMESTAMP WITH TIME ZONE,
  profiles JSONB
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    ap.employee_id,
    ap.attrition_risk,
    ap.risk_level,
    ap.predicted_at,
    json_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name,
      'department', p.department
    ) as profiles
  FROM attrition_predictions ap
  LEFT JOIN profiles p ON ap.employee_id = p.id
  ORDER BY ap.attrition_risk DESC;
$$;
