
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus } from 'lucide-react';
import SalaryTemplateForm from './SalaryTemplateForm';
import SalaryTemplateList from './SalaryTemplateList';

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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
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
            <SalaryTemplateForm
              onCancel={() => setIsCreating(false)}
              onSuccess={() => setIsCreating(false)}
            />
          )}

          <SalaryTemplateList templates={templates} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryTemplates;
