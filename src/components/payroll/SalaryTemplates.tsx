
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Template, Plus, Trash2 } from 'lucide-react';

interface SalaryTemplate {
  id: string;
  template_name: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  ctc: number;
  created_at: string;
}

const SalaryTemplates = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
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

  // Fetch salary templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['salary-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SalaryTemplate[];
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
      setIsCreating(false);
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

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('salary_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['salary-templates'] });
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Template className="w-5 h-5" />
              <span>Salary Templates</span>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating && (
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
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{template.template_name}</h4>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(template.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(template.ctc)}
                      </p>
                      <p className="text-sm text-gray-500">Annual CTC</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      disabled={deleteTemplateMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Basic:</span>
                    <p className="font-medium">{formatCurrency(template.basic_salary)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">HRA:</span>
                    <p className="font-medium">{formatCurrency(template.hra)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Special:</span>
                    <p className="font-medium">{formatCurrency(template.special_allowance)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Transport:</span>
                    <p className="font-medium">{formatCurrency(template.transport_allowance)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Medical:</span>
                    <p className="font-medium">{formatCurrency(template.medical_allowance)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Other:</span>
                    <p className="font-medium">{formatCurrency(template.other_allowances)}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {!templates.length && (
              <div className="text-center py-8 text-gray-500">
                No salary templates found. Create one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryTemplates;
