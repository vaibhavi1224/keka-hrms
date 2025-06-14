
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  designation: string;
  salary: string;
  date_of_joining: string;
}

export const useAddEmployee = (onSuccess: () => void) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'no-department',
    designation: '',
    salary: '',
    date_of_joining: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);

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

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    setFormData(prev => ({ ...prev, password }));
  };

  const addEmployeeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department === 'no-department' ? '' : formData.department,
          designation: formData.designation,
          salary: formData.salary,
          date_of_joining: formData.date_of_joining
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.credentials;
    },
    onSuccess: (credentials) => {
      setGeneratedCredentials(credentials);
      toast.success('Employee account created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to create employee account');
      console.error('Error creating employee:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    addEmployeeMutation.mutate();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setGeneratedCredentials(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'no-department',
      designation: '',
      salary: '',
      date_of_joining: ''
    });
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    generatedCredentials,
    departments,
    generatePassword,
    addEmployeeMutation,
    handleSubmit,
    handleChange,
    resetForm
  };
};
