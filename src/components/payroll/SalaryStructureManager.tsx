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
import { User, DollarSign, Plus, Edit, Save } from 'lucide-react';

interface SalaryStructure {
  id: string;
  employee_id: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  ctc: number;
  effective_from: string;
  is_active: boolean;
  revision_reason: string;
  revision_notes: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string;
  } | null;
}

const SalaryStructureManager = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    basic_salary: 0,
    hra: 0,
    special_allowance: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0,
    effective_from: new Date().toISOString().split('T')[0],
    revision_reason: '',
    revision_notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, employee_id')
        .eq('is_active', true)
        .order('first_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch salary structures
  const { data: salaryStructures, isLoading } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_structures')
        .select(`
          id,
          employee_id,
          basic_salary,
          hra,
          special_allowance,
          transport_allowance,
          medical_allowance,
          other_allowances,
          ctc,
          effective_from,
          is_active,
          revision_reason,
          revision_notes,
          profiles!employee_id (
            first_name,
            last_name,
            email,
            employee_id
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SalaryStructure[];
    }
  });

  // Create/Update salary structure
  const createSalaryStructure = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate CTC
      const ctc = data.basic_salary + data.hra + data.special_allowance + 
                 data.transport_allowance + data.medical_allowance + data.other_allowances;

      // Get current structure for revision tracking
      const { data: currentStructure } = await supabase
        .from('salary_structures')
        .select('ctc')
        .eq('employee_id', selectedEmployee)
        .eq('is_active', true)
        .single();

      // Deactivate existing structures for this employee
      await supabase
        .from('salary_structures')
        .update({ is_active: false })
        .eq('employee_id', selectedEmployee);

      // Create new structure with revision tracking
      const { error } = await supabase
        .from('salary_structures')
        .insert({
          ...data,
          employee_id: selectedEmployee,
          ctc,
          previous_ctc: currentStructure?.ctc || null,
          created_by: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary structure updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      queryClient.invalidateQueries({ queryKey: ['salary-revision-logs'] });
      setIsEditing(false);
      setSelectedEmployee('');
      setFormData({
        basic_salary: 0,
        hra: 0,
        special_allowance: 0,
        transport_allowance: 0,
        medical_allowance: 0,
        other_allowances: 0,
        effective_from: new Date().toISOString().split('T')[0],
        revision_reason: '',
        revision_notes: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }
    createSalaryStructure.mutate(formData);
  };

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

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>{isEditing ? 'Update' : 'Create'} Salary Structure</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id || emp.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_from">Effective From</Label>
                <Input
                  id="effective_from"
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basic_salary">Basic Salary (₹)</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: Number(e.target.value) }))}
                  required
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

            {/* Revision Tracking Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revision_reason">Revision Reason</Label>
                <Input
                  id="revision_reason"
                  value={formData.revision_reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, revision_reason: e.target.value }))}
                  placeholder="e.g., Annual increment, Promotion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revision_notes">Revision Notes</Label>
                <Textarea
                  id="revision_notes"
                  value={formData.revision_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, revision_notes: e.target.value }))}
                  placeholder="Additional notes about this revision"
                  rows={2}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total CTC:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateCTC())}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedEmployee('');
                  setFormData({
                    basic_salary: 0,
                    hra: 0,
                    special_allowance: 0,
                    transport_allowance: 0,
                    medical_allowance: 0,
                    other_allowances: 0,
                    effective_from: new Date().toISOString().split('T')[0],
                    revision_reason: '',
                    revision_notes: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSalaryStructure.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {createSalaryStructure.isPending ? 'Saving...' : 'Save Structure'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Salary Structures */}
      <Card>
        <CardHeader>
          <CardTitle>Current Salary Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salaryStructures?.map((structure) => (
              <div key={structure.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {structure.profiles?.first_name} {structure.profiles?.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {structure.profiles?.employee_id || structure.profiles?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Effective from: {new Date(structure.effective_from).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(structure.ctc)}
                    </p>
                    <p className="text-sm text-gray-500">Annual CTC</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Basic:</span>
                    <p className="font-medium">{formatCurrency(structure.basic_salary)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">HRA:</span>
                    <p className="font-medium">{formatCurrency(structure.hra)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Special:</span>
                    <p className="font-medium">{formatCurrency(structure.special_allowance)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Transport:</span>
                    <p className="font-medium">{formatCurrency(structure.transport_allowance)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Medical:</span>
                    <p className="font-medium">{formatCurrency(structure.medical_allowance)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Other:</span>
                    <p className="font-medium">{formatCurrency(structure.other_allowances)}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {!salaryStructures?.length && (
              <div className="text-center py-8 text-gray-500">
                No salary structures found. Create one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryStructureManager;
