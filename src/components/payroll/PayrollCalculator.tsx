
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calculator, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PayrollPeriodSelector from './PayrollPeriodSelector';
import PayrollActions from './PayrollActions';
import EmployeeSelectionList from './EmployeeSelectionList';

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
  const selectedEmployeesWithSalaryCount = selectedEmployees.filter(id => 
    employees.find(emp => emp.id === id)?.has_salary_structure
  ).length;

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
          <PayrollPeriodSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />

          {employeesWithoutSalary.length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {employeesWithoutSalary.length} employees don't have salary structures set up. 
                Please create salary structures in the "Structures" tab before calculating payroll.
              </AlertDescription>
            </Alert>
          )}

          <PayrollActions
            onCalculateAll={handleCalculateAll}
            onCalculateSelected={handleCalculateSelected}
            isLoading={calculatePayrollMutation.isPending}
            employeesWithSalaryCount={employeesWithSalary.length}
            selectedEmployeesWithSalaryCount={selectedEmployeesWithSalaryCount}
          />

          <EmployeeSelectionList
            employeesWithSalary={employeesWithSalary}
            employeesWithoutSalary={employeesWithoutSalary}
            selectedEmployees={selectedEmployees}
            manualAdjustments={manualAdjustments}
            onEmployeeSelection={handleEmployeeSelection}
            onManualAdjustmentUpdate={updateManualAdjustment}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollCalculator;
