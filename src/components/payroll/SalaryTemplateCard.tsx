
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

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

interface SalaryTemplateCardProps {
  template: SalaryTemplate;
}

const SalaryTemplateCard = ({ template }: SalaryTemplateCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="border rounded-lg p-4">
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
  );
};

export default SalaryTemplateCard;
