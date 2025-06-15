
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OnboardingWorkflow from './OnboardingWorkflow';
import OffboardingWorkflow from './OffboardingWorkflow';
import { ClipboardList } from 'lucide-react';
import type { Employee } from '@/types/employee';

const WorkflowManager = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [workflowType, setWorkflowType] = useState<'onboarding' | 'offboarding'>('onboarding');
  const [isOpen, setIsOpen] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-workflow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data as Employee[];
    }
  });

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start">
          <ClipboardList className="w-4 h-4 mr-2" />
          Manage Workflows
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Workflow Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Select Employee</label>
              <Select onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Workflow Type</label>
              <Select value={workflowType} onValueChange={(value) => setWorkflowType(value as 'onboarding' | 'offboarding')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="offboarding">Offboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmployee && (
            <div className="mt-6">
              {workflowType === 'onboarding' ? (
                <OnboardingWorkflow employee={selectedEmployee} />
              ) : (
                <OffboardingWorkflow employee={selectedEmployee} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowManager;
