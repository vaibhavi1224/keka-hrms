
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface AttritionEmployeeSelectionProps {
  employees: Employee[];
  selectedEmployees: string[];
  onSelectionChange: (employeeIds: string[]) => void;
  onRunPrediction: () => void;
  isRunning: boolean;
}

const AttritionEmployeeSelection = ({
  employees,
  selectedEmployees,
  onSelectionChange,
  onRunPrediction,
  isRunning
}: AttritionEmployeeSelectionProps) => {
  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEmployees, employeeId]);
    } else {
      onSelectionChange(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(employees.map(e => e.id));
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Employees for Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {employees.map((employee) => (
              <label key={employee.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={(e) => handleEmployeeToggle(employee.id, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{employee.first_name} {employee.last_name}</span>
              </label>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSelectAll}
              variant="outline"
              size="sm"
            >
              Select All
            </Button>
            <Button
              onClick={handleClearSelection}
              variant="outline"
              size="sm"
            >
              Clear Selection
            </Button>
            <Button
              onClick={onRunPrediction}
              disabled={selectedEmployees.length === 0 || isRunning}
              className="ml-auto"
            >
              Run Prediction ({selectedEmployees.length})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttritionEmployeeSelection;
