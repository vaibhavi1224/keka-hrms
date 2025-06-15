
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, FileText } from 'lucide-react';

interface PayrollActionsProps {
  onCalculateAll: () => void;
  onCalculateSelected: () => void;
  isLoading: boolean;
  employeesWithSalaryCount: number;
  selectedEmployeesWithSalaryCount: number;
}

const PayrollActions = ({
  onCalculateAll,
  onCalculateSelected,
  isLoading,
  employeesWithSalaryCount,
  selectedEmployeesWithSalaryCount
}: PayrollActionsProps) => {
  return (
    <div className="flex space-x-3 mb-6">
      <Button 
        onClick={onCalculateAll}
        disabled={isLoading || employeesWithSalaryCount === 0}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Users className="w-4 h-4 mr-2" />
        Calculate All Employees ({employeesWithSalaryCount})
      </Button>
      <Button 
        variant="outline"
        onClick={onCalculateSelected}
        disabled={isLoading || selectedEmployeesWithSalaryCount === 0}
      >
        <FileText className="w-4 h-4 mr-2" />
        Calculate Selected ({selectedEmployeesWithSalaryCount})
      </Button>
    </div>
  );
};

export default PayrollActions;
