
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmployeeProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  date_of_joining: string;
  working_hours_start: string;
  working_hours_end: string;
  manager_id: string;
}

export const useEmployeeProfile = (employee: any, onUpdate: () => void) => {
  const [formData, setFormData] = useState<EmployeeProfileFormData>({
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    designation: employee.designation || '',
    role: employee.role || 'employee',
    date_of_joining: employee.date_of_joining || '',
    working_hours_start: employee.working_hours_start || '09:00',
    working_hours_end: employee.working_hours_end || '17:00',
    manager_id: employee.manager_id || 'no-manager'
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'manager')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          role: formData.role,
          date_of_joining: formData.date_of_joining || null,
          working_hours_start: formData.working_hours_start || null,
          working_hours_end: formData.working_hours_end || null,
          manager_id: formData.manager_id === 'no-manager' ? null : formData.manager_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employee profile updated successfully');
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to update employee profile');
      console.error('Error updating employee:', error);
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployeeMutation.mutate();
  };

  return {
    formData,
    departments,
    managers,
    updateEmployeeMutation,
    handleChange,
    handleSubmit
  };
};
