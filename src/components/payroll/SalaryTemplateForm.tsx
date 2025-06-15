
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalaryTemplateFormData {
  template_name: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
}

interface SalaryTemplateFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const SalaryTemplateForm = ({ onCancel, onSuccess }: SalaryTemplateFormProps) => {
  const [formData, setFormData] = useState<SalaryTemplateFormData>({
    template_name: '',
    basic_salary: 0,
    hra: 0,
    special_allowance: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTemplateMutation = useMutation({
    mutationFn: async (data: SalaryTemplateFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ctc = data.basic_salary + data.hra + data.special_allowance + 
                 data.transport_allowance + data.medical_allowance + data.other_allowances;

      const { error } = await supabase
        .from('salary_templates')
        .insert({
          ...data,
          ctc,
          created_by: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['salary-templates'] });
      onSuccess();
      setFormData({
        template_name: '',
        basic_salary: 0,
        hra: 0,
        special_allowance: 0,
        transport_allowance: 0,
        medical_allowance: 0,
        other_allowances: 0
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const calculateCTC = () => {
    return formData.basic_salary + formData.hra + formData.special_allowance + 
           formData.transport_allowance + formData.medical_allowance + formData.other_allowances;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.template_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-6 p-4 border rounded-lg bg-gray-50">
      <div className="space-y-2">
        <Label htmlFor="template_name">Template Name</Label>
        <Input
          id="template_name"
          value={formData.template_name}
          onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
          placeholder="e.g., Junior Developer, Senior Manager"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="basic_salary">Basic Salary (₹)</Label>
          <Input
            id="basic_salary"
            type="number"
            value={formData.basic_salary}
            onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: Number(e.target.value) }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hra">HRA (₹)</Label>
          <Input
            id="hra"
            type="number"
            value={formData.hra}
            onChange={(e) => setFormData(prev => ({ ...prev, hra: Number(e.target.value) }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_allowance">Special Allowance (₹)</Label>
          <Input
            id="special_allowance"
            type="number"
            value={formData.special_allowance}
            onChange={(e) => setFormData(prev => ({ ...prev, special_allowance: Number(e.target.value) }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transport_allowance">Transport Allowance (₹)</Label>
          <Input
            id="transport_allowance"
            type="number"
            value={formData.transport_allowance}
            onChange={(e) => setFormData(prev => ({ ...prev, transport_allowance: Number(e.target.value) }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medical_allowance">Medical Allowance (₹)</Label>
          <Input
            id="medical_allowance"
            type="number"
            value={formData.medical_allowance}
            onChange={(e) => setFormData(prev => ({ ...prev, medical_allowance: Number(e.target.value) }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_allowances">Other Allowances (₹)</Label>
          <Input
            id="other_allowances"
            type="number"
            value={formData.other_allowances}
            onChange={(e) => setFormData(prev => ({ ...prev, other_allowances: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="bg-white p-3 rounded border">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total CTC:</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(calculateCTC())}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createTemplateMutation.isPending}>
          {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};

export default SalaryTemplateForm;
