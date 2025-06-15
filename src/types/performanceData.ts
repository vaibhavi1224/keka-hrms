export type { SeedResult } from './seedingResults';

export interface PerformanceMetric {
  employee_id: string;
  metric_type: string;
  metric_value: number;
  target_value: number;
  measurement_date: string;
  quarter: number;
  year: number;
  notes?: string;
}

export interface PerformanceFeedback {
  employee_id: string;
  feedback_type: 'self_review' | 'manager_review' | 'peer_review';
  feedback_text: string;
  rating: number;
  review_period_start: string;
  review_period_end: string;
  created_by: string;
}

export interface AttendanceRecord {
  user_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'present' | 'absent' | 'late';
  working_hours: number;
  biometric_verified: boolean;
  biometric_verified_out: boolean;
}
