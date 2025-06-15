
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface MetricFormData {
  metric_type: string;
  metric_value: number;
  target_value?: number;
  notes?: string;
}

export const PerformanceMetricsForm = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue, watch } = useForm<MetricFormData>();

  const metricType = watch('metric_type');

  const metricTypes = [
    { value: 'tasks_completed', label: 'Tasks Completed' },
    { value: 'attendance_rate', label: 'Attendance Rate' },
    { value: 'training_progress', label: 'Training Progress' },
    { value: 'goal_achievement', label: 'Goal Achievement' },
    { value: 'client_satisfaction', label: 'Client Satisfaction' },
    { value: 'code_quality', label: 'Code Quality Score' },
    { value: 'project_delivery', label: 'Project Delivery' }
  ];

  const onSubmit = async (data: MetricFormData) => {
    if (!user?.id) return;

    try {
      const currentDate = new Date();
      const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);

      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          employee_id: user.id,
          metric_type: data.metric_type,
          metric_value: data.metric_value,
          target_value: data.target_value,
          notes: data.notes,
          quarter,
          year: currentDate.getFullYear(),
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Metric Added",
        description: "Performance metric has been recorded successfully."
      });

      reset();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add performance metric. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Add Performance Metric
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="metric_type">Metric Type</Label>
            <Select onValueChange={(value) => setValue('metric_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metric_value">Current Value</Label>
              <Input
                id="metric_value"
                type="number"
                step="0.01"
                {...register('metric_value', { valueAsNumber: true, required: true })}
                placeholder="Enter current value"
              />
            </div>
            <div>
              <Label htmlFor="target_value">Target Value (Optional)</Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                {...register('target_value', { valueAsNumber: true })}
                placeholder="Enter target value"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any additional notes about this metric"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Metric
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
