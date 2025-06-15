
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Users, FileText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  has_salary_structure: boolean;
}

const PayrollCalculator = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, {
    bonus: number;
    deductions: number;
    notes: string;
  }>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Fetch all employees and check if they have salary structures
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-payroll'],
    queryFn: async () => {
      console.log('Fetching employees for payroll...');
      
      // First get all active employees
      const { data: allEmployees, error: employeeError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('is_active', true)
        .order('first_name');
      
      if (employeeError) {
        console.error('Error fetching employees:', employeeError);
        throw employeeError;
      }

      console.log('Found employees:', allEmployees?.length || 0);

      // Then check which ones have active salary structures
      const { data: salaryStructures, error: salaryError } = await supabase
        .from('salary_structures')
        .select('employee_id')
        .eq('is_active', true);
      
      if (salaryError) {
        console.error('Error fetching salary structures:', salaryError);
        throw salaryError;
      }

      console.log('Found salary structures:', salaryStructures?.length || 0);

      const employeesWithSalaryStructure = new Set(salaryStructures?.map(s => s.employee_id) || []);

      const result = allEmployees?.map(emp => ({
        ...emp,
        has_salary_structure: employeesWithSalaryStructure.has(emp.id)
      })) || [];

      console.log('Employees with salary structures:', result.filter(e => e.has_salary_structure).length);
      console.log('Employees without salary structures:', result.filter(e => !e.has_salary_structure).length);

      return result as Employee[];
    }
  });

  // Calculate payroll mutation
  const calculatePayrollMutation = useMutation({
    mutationFn: async ({ employeeIds }: { employeeIds: string[] }) => {
      const results = [];
      const errors = [];
      
      for (const employeeId of employeeIds) {
        try {
          const adjustments = manualAdjustments[employeeId] || { bonus: 0, deductions: 0, notes: '' };
          
          console.log(`Calculating payroll for employee: ${employeeId}`);
          
          const { data, error } = await supabase.rpc('calculate_payroll', {
            p_employee_id: employeeId,
            p_month: selectedMonth,
            p_year: selectedYear,
            p_manual_bonus: adjustments.bonus,
            p_manual_deductions: adjustments.deductions,
            p_manual_notes: adjustments.notes || null
          });
          
          if (error) {
            console.error(`Error calculating payroll for ${employeeId}:`, error);
            errors.push({ employeeId, error: error.message });
          } else {
            results.push({ employeeId, payrollId: data });
          }
        } catch (err) {
          console.error(`Exception calculating payroll for ${employeeId}:`, err);
          errors.push({ employeeId, error: (err as Error).message });
        }
      }
      
      return { results, errors };
    },
    onSuccess: ({ results, errors }) => {
      if (results.length > 0) {
        toast({
          title: "Success",
          description: `Payroll calculated for ${results.length} employees`,
        });
      }
      
      if (errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `${errors.length} employees failed: ${errors.map(e => e.error).join(', ')}`,
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      setSelectedEmployees([]);
      setManualAdjustments({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleEmployeeSelection = (employeeId: string, selected: boolean) => {
    if (selected) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
      setManualAdjustments(prev => {
        const updated = { ...prev };
        delete updated[employeeId];
        return updated;
      });
    }
  };

  const updateManualAdjustment = (employeeId: string, field: 'bonus' | 'deductions' | 'notes', value: string | number) => {
    setManualAdjustments(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId] || { bonus: 0, deductions: 0, notes: '' },
        [field]: value
      }
    }));
  };

  const handleCalculateAll = () => {
    const employeesWithSalary = employees.filter(emp => emp.has_salary_structure);
    if (employeesWithSalary.length === 0) {
      toast({
        title: "Error",
        description: "No employees with salary structures found",
        variant: "destructive",
      });
      return;
    }
    const allEmployeeIds = employeesWithSalary.map(emp => emp.id);
    calculatePayrollMutation.mutate({ employeeIds: allEmployeeIds });
  };

  const handleCalculateSelected = () => {
    const selectedWithSalary = selectedEmployees.filter(id => 
      employees.find(emp => emp.id === id)?.has_salary_structure
    );
    
    if (selectedWithSalary.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one employee with a salary structure",
        variant: "destructive",
      });
      return;
    }
    calculatePayrollMutation.mutate({ employeeIds: selectedWithSalary });
  };

  const employeesWithSalary = employees.filter(emp => emp.has_salary_structure);
  const employeesWithoutSalary = employees.filter(emp => !emp.has_salary_structure);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Payroll Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Select Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {employeesWithoutSalary.length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {employeesWithoutSalary.length} employees don't have salary structures set up. 
                Please create salary structures in the "Structures" tab before calculating payroll.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3 mb-6">
            <Button 
              onClick={handleCalculateAll}
              disabled={calculatePayrollMutation.isPending || employeesWithSalary.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Calculate All Employees ({employeesWithSalary.length})
            </Button>
            <Button 
              variant="outline"
              onClick={handleCalculateSelected}
              disabled={calculatePayrollMutation.isPending || selectedEmployees.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Calculate Selected ({selectedEmployees.filter(id => 
                employees.find(emp => emp.id === id)?.has_salary_structure
              ).length})
            </Button>
          </div>

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
                        onChange={(e) => handleEmployeeSelection(employee.id, e.target.checked)}
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
                            onChange={(e) => updateManualAdjustment(employee.id, 'bonus', Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deductions (₹)</Label>
                          <Input
                            type="number"
                            value={manualAdjustments[employee.id]?.deductions || 0}
                            onChange={(e) => updateManualAdjustment(employee.id, 'deductions', Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={manualAdjustments[employee.id]?.notes || ''}
                            onChange={(e) => updateManualAdjustment(employee.id, 'notes', e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollCalculator;
