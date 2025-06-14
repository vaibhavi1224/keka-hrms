
import React, { useState } from 'react';
import { X, UserMinus, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OffboardEmployeeProps {
  employee: any;
  onClose: () => void;
  onSuccess: () => void;
}

const OffboardEmployee = ({ employee, onClose, onSuccess }: OffboardEmployeeProps) => {
  const [formData, setFormData] = useState({
    last_working_date: '',
    exit_reason: '',
    feedback: ''
  });
  const { profile } = useProfile();

  const offboardMutation = useMutation({
    mutationFn: async () => {
      // Update employee status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          last_working_date: formData.last_working_date || null,
          status: 'INACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);

      if (profileError) throw profileError;

      // Log offboarding
      const { error: logError } = await supabase
        .from('offboarding_logs')
        .insert({
          employee_id: employee.id,
          last_working_date: formData.last_working_date || null,
          exit_reason: formData.exit_reason || null,
          feedback: formData.feedback || null,
          processed_by: profile?.id
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      toast.success('Employee offboarded successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to offboard employee');
      console.error('Error offboarding employee:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    offboardMutation.mutate();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <UserMinus className="w-5 h-5" />
            Offboard Employee
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will deactivate {employee.first_name} {employee.last_name}'s account 
              and revoke their access to the system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="lastWorkingDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last Working Date
              </Label>
              <Input
                id="lastWorkingDate"
                type="date"
                value={formData.last_working_date}
                onChange={(e) => handleChange('last_working_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="exitReason">Exit Reason</Label>
              <Select value={formData.exit_reason} onValueChange={(value) => handleChange('exit_reason', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resignation">Resignation</SelectItem>
                  <SelectItem value="termination">Termination</SelectItem>
                  <SelectItem value="layoff">Layoff</SelectItem>
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="contract_end">Contract End</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feedback" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Notes/Feedback
              </Label>
              <Textarea
                id="feedback"
                placeholder="Any additional notes or feedback about the offboarding..."
                value={formData.feedback}
                onChange={(e) => handleChange('feedback', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                className="flex-1"
                disabled={offboardMutation.isPending}
              >
                {offboardMutation.isPending ? 'Processing...' : 'Offboard Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffboardEmployee;
