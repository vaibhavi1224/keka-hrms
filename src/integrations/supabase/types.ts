export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          biometric_verified: boolean | null
          biometric_verified_out: boolean | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          user_id: string
          working_hours: number | null
        }
        Insert: {
          biometric_verified?: boolean | null
          biometric_verified_out?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          user_id: string
          working_hours?: number | null
        }
        Update: {
          biometric_verified?: boolean | null
          biometric_verified_out?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          user_id?: string
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_credentials: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          id: string
          public_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          id?: string
          public_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          id?: string
          public_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          level: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          level?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          level?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          employee_id: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          employee_id: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          employee_id?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_bank_details: {
        Row: {
          aadhaar_number: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          employee_id: string
          id: string
          ifsc_code: string | null
          pan_number: string | null
          uan_number: string | null
          updated_at: string
        }
        Insert: {
          aadhaar_number?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          employee_id: string
          id?: string
          ifsc_code?: string | null
          pan_number?: string | null
          uan_number?: string | null
          updated_at?: string
        }
        Update: {
          aadhaar_number?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          ifsc_code?: string | null
          pan_number?: string | null
          uan_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_bank_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          profile_id: string
          salary: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          profile_id: string
          salary?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          profile_id?: string
          salary?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_accrual_logs: {
        Row: {
          accrual_date: string
          accrual_reason: string | null
          accrued_amount: number
          created_at: string
          employee_id: string
          id: string
          leave_type_id: string
        }
        Insert: {
          accrual_date?: string
          accrual_reason?: string | null
          accrued_amount: number
          created_at?: string
          employee_id: string
          id?: string
          leave_type_id: string
        }
        Update: {
          accrual_date?: string
          accrual_reason?: string | null
          accrued_amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          leave_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_accrual_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_accrual_logs_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          accrual_year: number
          available_balance: number | null
          created_at: string
          employee_id: string
          id: string
          last_accrued_date: string | null
          leave_type_id: string
          total_allocated: number
          updated_at: string
          used_leaves: number
        }
        Insert: {
          accrual_year?: number
          available_balance?: number | null
          created_at?: string
          employee_id: string
          id?: string
          last_accrued_date?: string | null
          leave_type_id: string
          total_allocated?: number
          updated_at?: string
          used_leaves?: number
        }
        Update: {
          accrual_year?: number
          available_balance?: number | null
          created_at?: string
          employee_id?: string
          id?: string
          last_accrued_date?: string | null
          leave_type_id?: string
          total_allocated?: number
          updated_at?: string
          used_leaves?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_requested: number
          end_date: string
          id: string
          leave_type: string
          leave_type_id: string | null
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested: number
          end_date: string
          id?: string
          leave_type: string
          leave_type_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          end_date?: string
          id?: string
          leave_type?: string
          leave_type_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          accrual_rate: number
          carry_forward: boolean
          created_at: string
          created_by: string | null
          description: string | null
          encashable: boolean
          id: string
          is_active: boolean
          max_leaves_per_year: number
          name: string
          updated_at: string
        }
        Insert: {
          accrual_rate?: number
          carry_forward?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          encashable?: boolean
          id?: string
          is_active?: boolean
          max_leaves_per_year?: number
          name: string
          updated_at?: string
        }
        Update: {
          accrual_rate?: number
          carry_forward?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          encashable?: boolean
          id?: string
          is_active?: boolean
          max_leaves_per_year?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_logs: {
        Row: {
          created_at: string
          employee_id: string
          exit_reason: string | null
          feedback: string | null
          id: string
          last_working_date: string | null
          processed_by: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          exit_reason?: string | null
          feedback?: string | null
          id?: string
          last_working_date?: string | null
          processed_by: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          exit_reason?: string | null
          feedback?: string | null
          id?: string
          last_working_date?: string | null
          processed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_logs_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_structure: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          manager_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id: string
          id?: string
          manager_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          manager_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_structure_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_structure_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payrolls: {
        Row: {
          basic_salary: number
          bonus: number
          created_at: string
          created_by: string
          employee_id: string
          esi: number
          finalized_at: string | null
          finalized_by: string | null
          hra: number
          id: string
          lop_days: number
          lop_deduction: number
          medical_allowance: number
          month: number
          net_pay: number
          notes: string | null
          other_allowances: number
          other_deductions: number
          pf: number
          present_days: number
          special_allowance: number
          status: string
          tds: number
          total_deductions: number
          total_earnings: number
          transport_allowance: number
          updated_at: string
          working_days: number
          year: number
        }
        Insert: {
          basic_salary?: number
          bonus?: number
          created_at?: string
          created_by: string
          employee_id: string
          esi?: number
          finalized_at?: string | null
          finalized_by?: string | null
          hra?: number
          id?: string
          lop_days?: number
          lop_deduction?: number
          medical_allowance?: number
          month: number
          net_pay?: number
          notes?: string | null
          other_allowances?: number
          other_deductions?: number
          pf?: number
          present_days?: number
          special_allowance?: number
          status?: string
          tds?: number
          total_deductions?: number
          total_earnings?: number
          transport_allowance?: number
          updated_at?: string
          working_days?: number
          year: number
        }
        Update: {
          basic_salary?: number
          bonus?: number
          created_at?: string
          created_by?: string
          employee_id?: string
          esi?: number
          finalized_at?: string | null
          finalized_by?: string | null
          hra?: number
          id?: string
          lop_days?: number
          lop_deduction?: number
          medical_allowance?: number
          month?: number
          net_pay?: number
          notes?: string | null
          other_allowances?: number
          other_deductions?: number
          pf?: number
          present_days?: number
          special_allowance?: number
          status?: string
          tds?: number
          total_deductions?: number
          total_earnings?: number
          transport_allowance?: number
          updated_at?: string
          working_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payrolls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payrolls_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payrolls_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_feedback: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string
          feedback_text: string
          feedback_type: string
          id: string
          rating: number | null
          review_period_end: string
          review_period_start: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id: string
          feedback_text: string
          feedback_type: string
          id?: string
          rating?: number | null
          review_period_end: string
          review_period_start: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string
          feedback_text?: string
          feedback_type?: string
          id?: string
          rating?: number | null
          review_period_end?: string
          review_period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_feedback_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_feedback_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_insights: {
        Row: {
          confidence_score: number | null
          employee_id: string
          generated_at: string
          id: string
          insight_summary: string
          insight_title: string
          insight_type: string
          is_active: boolean
          period_end: string
          period_start: string
          supporting_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          employee_id: string
          generated_at?: string
          id?: string
          insight_summary: string
          insight_title: string
          insight_type: string
          is_active?: boolean
          period_end: string
          period_start: string
          supporting_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          employee_id?: string
          generated_at?: string
          id?: string
          insight_summary?: string
          insight_title?: string
          insight_type?: string
          is_active?: boolean
          period_end?: string
          period_start?: string
          supporting_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_insights_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          measurement_date: string
          metric_type: string
          metric_value: number
          notes: string | null
          quarter: number
          target_value: number | null
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          measurement_date?: string
          metric_type: string
          metric_value: number
          notes?: string | null
          quarter: number
          target_value?: number | null
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          measurement_date?: string
          metric_type?: string
          metric_value?: number
          notes?: string | null
          quarter?: number
          target_value?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_metrics_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          conditions: Json | null
          created_at: string
          id: string
          resource: string
          role: string
        }
        Insert: {
          action: string
          conditions?: Json | null
          created_at?: string
          id?: string
          resource: string
          role: string
        }
        Update: {
          action?: string
          conditions?: Json | null
          created_at?: string
          id?: string
          resource?: string
          role?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          auth_method: string | null
          created_at: string
          date_of_joining: string | null
          department: string | null
          designation: string | null
          designation_id: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_code: string | null
          employee_id: string | null
          first_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          last_name: string | null
          last_working_date: string | null
          manager_id: string | null
          onboarding_status: string | null
          phone: string | null
          profile_picture: string | null
          reporting_manager_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          updated_at: string
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          address?: string | null
          auth_method?: string | null
          created_at?: string
          date_of_joining?: string | null
          department?: string | null
          designation?: string | null
          designation_id?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_code?: string | null
          employee_id?: string | null
          first_name?: string | null
          id: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_name?: string | null
          last_working_date?: string | null
          manager_id?: string | null
          onboarding_status?: string | null
          phone?: string | null
          profile_picture?: string | null
          reporting_manager_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          address?: string | null
          auth_method?: string | null
          created_at?: string
          date_of_joining?: string | null
          department?: string | null
          designation?: string | null
          designation_id?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_code?: string | null
          employee_id?: string | null
          first_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_name?: string | null
          last_working_date?: string | null
          manager_id?: string | null
          onboarding_status?: string | null
          phone?: string | null
          profile_picture?: string | null
          reporting_manager_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_structures: {
        Row: {
          basic_salary: number
          created_at: string
          created_by: string
          ctc: number
          effective_from: string
          employee_id: string
          hra: number
          id: string
          is_active: boolean
          medical_allowance: number
          other_allowances: number
          special_allowance: number
          transport_allowance: number
          updated_at: string
        }
        Insert: {
          basic_salary?: number
          created_at?: string
          created_by: string
          ctc?: number
          effective_from: string
          employee_id: string
          hra?: number
          id?: string
          is_active?: boolean
          medical_allowance?: number
          other_allowances?: number
          special_allowance?: number
          transport_allowance?: number
          updated_at?: string
        }
        Update: {
          basic_salary?: number
          created_at?: string
          created_by?: string
          ctc?: number
          effective_from?: string
          employee_id?: string
          hra?: number
          id?: string
          is_active?: boolean
          medical_allowance?: number
          other_allowances?: number
          special_allowance?: number
          transport_allowance?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_structures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_structures_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_templates: {
        Row: {
          basic_salary: number
          created_at: string
          created_by: string
          ctc: number
          hra: number
          id: string
          medical_allowance: number
          other_allowances: number
          special_allowance: number
          template_name: string
          transport_allowance: number
        }
        Insert: {
          basic_salary?: number
          created_at?: string
          created_by: string
          ctc?: number
          hra?: number
          id?: string
          medical_allowance?: number
          other_allowances?: number
          special_allowance?: number
          template_name: string
          transport_allowance?: number
        }
        Update: {
          basic_salary?: number
          created_at?: string
          created_by?: string
          ctc?: number
          hra?: number
          id?: string
          medical_allowance?: number
          other_allowances?: number
          special_allowance?: number
          template_name?: string
          transport_allowance?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          required_role: string | null
          step_description: string | null
          step_name: string
          step_number: number
          workflow_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          required_role?: string | null
          step_description?: string | null
          step_name: string
          step_number: number
          workflow_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          required_role?: string | null
          step_description?: string | null
          step_name?: string
          step_number?: number
          workflow_type?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number | null
          employee_id: string
          id: string
          initiated_by: string
          status: string
          step_data: Json | null
          total_steps: number
          updated_at: string
          workflow_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          employee_id: string
          id?: string
          initiated_by: string
          status?: string
          step_data?: Json | null
          total_steps: number
          updated_at?: string
          workflow_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          employee_id?: string
          id?: string
          initiated_by?: string
          status?: string
          step_data?: Json | null
          total_steps?: number
          updated_at?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: {
          resource: string
          action: string
          conditions: Json
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: { user_uuid: string; resource_name: string; action_name: string }
        Returns: boolean
      }
      is_hr: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_manager_or_hr: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      process_monthly_leave_accrual: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "half_day"
      leave_status: "pending" | "approved" | "rejected"
      user_role: "hr" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: ["present", "absent", "late", "half_day"],
      leave_status: ["pending", "approved", "rejected"],
      user_role: ["hr", "manager", "employee"],
    },
  },
} as const
