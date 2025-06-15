
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Plus } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
}

const MissingSalaryStructures = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [formData, setFormData] = useState({
    basic_salary: 25000,
    hra: 10000,
    special_allowance: 5000,
    transport_allowance: 2000,
    medical_allowance: 1500,
    other_allowances: 1500,
    effective_from: new Date().toISOString().split('T')[0],
    revision_reason: 'Initial salary structure',
    revision_notes: 'First time salary structure assignment'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees without salary structures
  const { data: employeesWithoutSalary = [], isLoading } = useQuery({
    queryKey: ['employees-without-salary'],
    queryFn: async () => {
      console.log('Fetching employees without salary structures...');
      
      // Get all active employees
      const { data: allEmployees, error: employeeError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, employee_id')
        .eq('is_active', true)
        .order('first_name');
      
      if (employeeError) {
        console.error('Error fetching employees:', employeeError);
        throw employeeError;
      }

      // Get employees with active salary structures
      const { data: employeesWithSalary, error: salaryError } = await supabase
        .from('salary_structures')
        .select('employee_id')
        .eq('is_active', true);
      
      if (salaryError) {
        console.error('Error fetching salary structures:', salaryError);
        throw salaryError;
      }

      const employeeIdsWithSalary = new Set(employeesWithSalary?.map(s => s.employee_id) || []);
      
      // Filter employees without salary structures
      const employeesWithoutSalaryStructures = allEmployees?.filter(emp => 
        !employeeIdsWithSalary.has(emp.id)
      ) || [];

      console.log('Employees without salary structures:', employeesWithoutSalaryStructures.length);
      return employeesWithoutSalaryStructures as Employee[];
    }
  });

  // Create salary structure mutation
  const createSalaryStructure = useMutation({
    mutationFn: async (employeeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate CTC
      const ctc = formData.basic_salary + formData.hra + formData.special_allowance + 
                 formData.transport_allowance + formData.medical_allowance + formData.other_allowances;

      const { error } = await supabase
        .from('salary_structures')
        .insert({
          employee_id: employeeId,
          basic_salary: formData.basic_salary,
          hra: formData.hra,
          special_allowance: formData.special_allowance,
          transport_allowance: formData.transport_allowance,
          medical_allowance: formData.medical_allowance,
          other_allowances: formData.other_allowances,
          ctc,
          effective_from: formData.effective_from,
          revision_reason: formData.revision_reason,
          revision_notes: formData.revision_notes,
          created_by: user.id
        });

      if (error) throw error;
      return employeeId;
    },
    onSuccess: (employeeId) => {
      const employee = employeesWithoutSalary.find(emp => emp.id === employeeId);
      toast({
        title: "Success",
        description: `Salary structure created for ${employee?.first_name} ${employee?.last_name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['employees-without-salary'] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      queryClient.invalidateQueries({ queryKey: ['employees-for-payroll'] });
      setSelectedEmployee('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Quick assign to all employees
  const assignToAllMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ctc = formData.basic_salary + formData.hra + formData.special_allowance + 
                 formData.transport_allowance + formData.medical_allowance + formData.other_allowances;

      const salaryStructures = employeesWithoutSalary.map(employee => ({
        employee_id: employee.id,
        basic_salary: formData.basic_salary,
        hra: formData.hra,
        special_allowance: formData.special_allowance,
        transport_allowance: formData.transport_allowance,
        medical_allowance: formData.medical_allowance,
        other_allowances: formData.other_allowances,
        ctc,
        effective_from: formData.effective_from,
        revision_reason: formData.revision_reason,
        revision_notes: formData.revision_notes,
        created_by: user.id
      }));

      const { error } = await supabase
        .from('salary_structures')
        .insert(salaryStructures);

      if (error) throw error;
      return salaryStructures.length;
    },
    onSuccess: (count) => {
      toast({
        title: "Success",
        description: `Salary structures created for ${count} employees`,
      });
      queryClient.invalidateQueries({ queryKey: ['employees-without-salary'] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      queryClient.invalidateQueries({ queryKey: ['employees-for-payroll'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const calculateCTC = () => {
    return formData.basic_salary + formData.hra + formData.special_allowance + 
           formData.transport_allowance + formData.medical_allowance + formData.other_allowances;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (employeesWithoutSalary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <Plus className="w-5 h-5" />
            <span>All Set!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">All employees have salary structures assigned.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Missing Salary Structures ({employeesWithoutSalary.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Salary Structure Template */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Default Salary Structure Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="basic_salary">Basic Salary (₹)</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hra">HRA (₹)</Label>
                <Input
                  id="hra"
                  type="number"
                  value={formData.hra}
                  onChange={(e) => setFormData(prev => ({ ...prev, hra: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_allowance">Special Allowance (₹)</Label>
                <Input
                  id="special_allowance"
                  type="number"
                  value={formData.special_allowance}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_allowance: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transport_allowance">Transport Allowance (₹)</Label>
                <Input
                  id="transport_allowance"
                  type="number"
                  value={formData.transport_allowance}
                  onChange={(e) => setFormData(prev => ({ ...prev, transport_allowance: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_allowance">Medical Allowance (₹)</Label>
                <Input
                  id="medical_allowance"
                  type="number"
                  value={formData.medical_allowance}
                  onChange={(e) => setFormData(prev => ({ ...prev, medical_allowance: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other_allowances">Other Allowances (₹)</Label>
                <Input
                  id="other_allowances"
                  type="number"
                  value={formData.other_allowances}
                  onChange={(e) => setFormData(prev => ({ ...prev, other_allowances: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total CTC:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(calculateCTC())}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <Button 
                onClick={() => assignToAllMutation.mutate()}
                disabled={assignToAllMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign to All {employeesWithoutSalary.length} Employees
              </Button>
            </div>
          </div>

          {/* Individual Assignment */}
          <div className="space-y-4">
            <h4 className="font-semibold">Or Assign Individual Employee</h4>
            <div className="flex space-x-3">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeesWithoutSalary.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id || emp.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => selectedEmployee && createSalaryStructure.mutate(selectedEmployee)}
                disabled={!selectedEmployee || createSalaryStructure.isPending}
              >
                Assign Structure
              </Button>
            </div>
          </div>

          {/* List of employees without salary structures */}
          <div className="space-y-2">
            <h4 className="font-semibold">Employees Missing Salary Structures:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {employeesWithoutSalary.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                  <span className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {employee.employee_id || employee.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissingSalaryStructures;
