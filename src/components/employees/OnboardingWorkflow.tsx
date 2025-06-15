
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import type { Workflow, WorkflowStep, Employee } from '@/types/employee';

interface OnboardingWorkflowProps {
  employee: Employee;
}

const OnboardingWorkflow = ({ employee }: OnboardingWorkflowProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canUpdate } = usePermissions();
  const [processingStep, setProcessingStep] = useState<number | null>(null);

  const { data: workflow } = useQuery({
    queryKey: ['workflow', employee.id, 'onboarding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('workflow_type', 'onboarding')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const { data: workflowSteps = [] } = useQuery({
    queryKey: ['workflow-steps', 'onboarding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_type', 'onboarding')
        .order('step_number');

      if (error) throw error;
      return data;
    }
  });

  const startOnboardingMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('workflows')
        .insert([{
          employee_id: employee.id,
          workflow_type: 'onboarding',
          current_step: 1,
          total_steps: workflowSteps.length,
          status: 'in_progress',
          initiated_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', employee.id, 'onboarding'] });
      toast({ title: 'Onboarding workflow started' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error starting onboarding', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const completeStepMutation = useMutation({
    mutationFn: async (stepNumber: number) => {
      setProcessingStep(stepNumber);
      
      if (!workflow) throw new Error('No workflow found');

      const nextStep = stepNumber + 1;
      const isLastStep = stepNumber === workflowSteps.length;
      
      const updates: any = {
        current_step: isLastStep ? stepNumber : nextStep,
        status: isLastStep ? 'completed' : 'in_progress'
      };

      if (isLastStep) {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', workflow.id);

      if (error) throw error;

      // Update employee onboarding status if completed
      if (isLastStep) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ onboarding_status: 'completed' })
          .eq('id', employee.id);

        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', employee.id, 'onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setProcessingStep(null);
      toast({ title: 'Step completed successfully' });
    },
    onError: (error: any) => {
      setProcessingStep(null);
      toast({ 
        title: 'Error completing step', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const getStepStatus = (stepNumber: number) => {
    if (!workflow) return 'pending';
    if (stepNumber < workflow.current_step) return 'completed';
    if (stepNumber === workflow.current_step && workflow.status === 'in_progress') return 'current';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'current':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const progressPercentage = workflow 
    ? ((workflow.current_step - 1) / workflowSteps.length) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Onboarding Workflow - {employee.first_name} {employee.last_name}
        </CardTitle>
        {workflow && (
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-gray-600">
              Step {workflow.current_step} of {workflow.total_steps} - {workflow.status}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!workflow ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No onboarding workflow started yet</p>
            {canUpdate('workflows') && (
              <Button onClick={() => startOnboardingMutation.mutate()}>
                Start Onboarding
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {workflowSteps.map((step) => {
              const status = getStepStatus(step.step_number);
              const canCompleteStep = status === 'current' && canUpdate('workflows');
              const isProcessing = processingStep === step.step_number;

              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    status === 'completed' ? 'bg-green-50' :
                    status === 'current' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStepIcon(status)}
                    <div>
                      <h3 className="font-medium">{step.step_name}</h3>
                      {step.step_description && (
                        <p className="text-sm text-gray-600">{step.step_description}</p>
                      )}
                      {step.required_role && (
                        <p className="text-xs text-gray-500">Required role: {step.required_role}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStepBadgeVariant(status)}>
                      {status === 'completed' ? 'Completed' :
                       status === 'current' ? 'In Progress' : 'Pending'}
                    </Badge>
                    {canCompleteStep && (
                      <Button
                        size="sm"
                        onClick={() => completeStepMutation.mutate(step.step_number)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Complete'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingWorkflow;
