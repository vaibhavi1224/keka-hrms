
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmployeeData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'employee' | 'manager' | 'hr';
  phone?: string;
  department?: string;
  designation?: string;
  date_of_joining?: string;
  address?: string;
  manager_id?: string;
}

export const useAddEmployee = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addEmployee = async (employeeData: EmployeeData) => {
    setIsLoading(true);
    
    try {
      console.log('Starting employee creation process');
      
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: employeeData
      });

      if (error) {
        console.error('Function invocation error');
        
        if (error.message?.includes('Password does not meet security requirements')) {
          toast.error('Password Security Error', {
            description: 'Password does not meet the required security standards'
          });
        } else if (error.message?.includes('Invalid email')) {
          toast.error('Invalid Email', {
            description: 'Please provide a valid email address'
          });
        } else {
          toast.error('Failed to create employee', {
            description: error.message || 'An unexpected error occurred'
          });
        }
        throw error;
      }

      if (!data?.success) {
        const errorMessage = data?.error || 'Unknown error occurred';
        console.error('Employee creation failed');
        toast.error('Failed to create employee', {
          description: errorMessage
        });
        throw new Error(errorMessage);
      }

      console.log('Employee created successfully');
      toast.success('Employee created successfully', {
        description: 'The new employee account has been set up and they will receive login instructions.'
      });

      return {
        success: true,
        employee_id: data.employee_id,
        onboarding_status: data.onboarding_status
      };

    } catch (error: any) {
      console.error('Error in addEmployee');
      
      if (!error.message?.includes('Password') && !error.message?.includes('email')) {
        toast.error('Failed to create employee', {
          description: 'Please check your connection and try again'
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addEmployee,
    isLoading
  };
};
