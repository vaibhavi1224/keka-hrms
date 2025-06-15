
export interface PerformanceMetric {
  employee_id: string;
  metric_type: string;
  metric_value: number;
  target_value?: number;
  measurement_date: string;
  quarter: number;
  year: number;
  notes?: string;
}

export interface PerformanceFeedback {
  employee_id: string;
  feedback_type: string;
  feedback_text: string;
  rating: number;
  review_period_start: string;
  review_period_end: string;
  created_by?: string; // Make created_by optional to handle RLS
}

export interface AttendanceRecord {
  user_id: string;
  date: string;
  check_in_time: string | null; // Allow null for absent days
  check_out_time: string | null; // Allow null for absent days
  status: 'present' | 'absent' | 'late' | 'half_day';
  working_hours: number;
  biometric_verified: boolean;
  biometric_verified_out: boolean;
}

export interface SeedResult {
  success: number;
  errors: number;
}
