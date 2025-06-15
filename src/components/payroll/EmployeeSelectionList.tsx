
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  has_salary_structure: boolean;
}

interface ManualAdjustment {
  bonus: number;
  deductions: number;
  notes: string;
}

interface EmployeeSelectionListProps {
  employeesWithSalary: Employee[];
  employeesWithoutSalary: Employee[];
  selectedEmployees: string[];
  manualAdjustments: Record<string, ManualAdjustment>;
  onEmployeeSelection: (employeeId: string, selected: boolean) => void;
  onManualAdjustmentUpdate: (employeeId: string, field: 'bonus' | 'deductions' | 'notes', value: string | number) => void;
}

const EmployeeSelectionList = ({
  employeesWithSalary,
  employeesWithoutSalary,
  selectedEmployees,
  manualAdjustments,
  onEmployeeSelection,
  onManualAdjustmentUpdate
}: EmployeeSelectionListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Employee Selection & Manual Adjustments</h3>
      
      {employeesWithSalary.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-3">
            Employees Ready for Payroll ({employeesWithSalary.length})
          </h4>
          {employeesWithSalary.map((employee) => (
            <div key={employee.id} className="border rounded-lg p-4 mb-3">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={(e) => onEmployeeSelection(employee.id, e.target.checked)}
                  className="rounded"
                />
                <span className="font-medium">
                  {employee.first_name} {employee.last_name} ({employee.employee_id})
                </span>
              </div>
              
              {selectedEmployees.includes(employee.id) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-6">
                  <div className="space-y-2">
                    <Label>Bonus (₹)</Label>
                    <Input
                      type="number"
                      value={manualAdjustments[employee.id]?.bonus || 0}
                      onChange={(e) => onManualAdjustmentUpdate(employee.id, 'bonus', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deductions (₹)</Label>
                    <Input
                      type="number"
                      value={manualAdjustments[employee.id]?.deductions || 0}
                      onChange={(e) => onManualAdjustmentUpdate(employee.id, 'deductions', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={manualAdjustments[employee.id]?.notes || ''}
                      onChange={(e) => onManualAdjustmentUpdate(employee.id, 'notes', e.target.value)}
                      placeholder="Optional notes"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {employeesWithoutSalary.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-3">
            Employees Missing Salary Structures ({employeesWithoutSalary.length})
          </h4>
          {employeesWithoutSalary.map((employee) => (
            <div key={employee.id} className="border border-red-200 rounded-lg p-4 mb-3 bg-red-50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-700">
                  {employee.first_name} {employee.last_name} ({employee.employee_id})
                </span>
                <span className="text-sm text-red-600">No salary structure</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeSelectionList;
