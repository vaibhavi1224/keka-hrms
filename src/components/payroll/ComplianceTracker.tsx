
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
import { Shield, Plus, Edit } from 'lucide-react';

interface ComplianceRecord {
  id: string;
  employee_id: string;
  month: string;
  pf_contribution: number;
  esi_contribution: number;
  tds_deducted: number;
  remarks: string;
  profiles: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

const ComplianceTracker = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    pf_contribution: 0,
    esi_contribution: 0,
    tds_deducted: 0,
    remarks: ''
  });
  const [editingRecord, setEditingRecord] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('is_active', true)
        .order('first_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch compliance records
  const { data: complianceRecords = [] } = useQuery({
    queryKey: ['compliance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_logs')
        .select(`
          id,
          employee_id,
          month,
          pf_contribution,
          esi_contribution,
          tds_deducted,
          remarks,
          profiles!employee_id (
            first_name,
            last_name,
            employee_id
          )
        `)
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as ComplianceRecord[];
    }
  });

  // Create/Update compliance record
  const saveComplianceMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingRecord) {
        const { error } = await supabase
          .from('compliance_logs')
          .update({
            pf_contribution: data.pf_contribution,
            esi_contribution: data.esi_contribution,
            tds_deducted: data.tds_deducted,
            remarks: data.remarks
          })
          .eq('id', editingRecord);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('compliance_logs')
          .insert({
            employee_id: selectedEmployee,
            month: selectedMonth + '-01',
            pf_contribution: data.pf_contribution,
            esi_contribution: data.esi_contribution,
            tds_deducted: data.tds_deducted,
            remarks: data.remarks,
            created_by: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Compliance record saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['compliance-records'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setFormData({
      pf_contribution: 0,
      esi_contribution: 0,
      tds_deducted: 0,
      remarks: ''
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: ComplianceRecord) => {
    setSelectedEmployee(record.employee_id);
    setSelectedMonth(record.month.slice(0, 7));
    setFormData({
      pf_contribution: record.pf_contribution,
      esi_contribution: record.esi_contribution,
      tds_deducted: record.tds_deducted,
      remarks: record.remarks || ''
    });
    setEditingRecord(record.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee && !editingRecord) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }
    saveComplianceMutation.mutate(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>{editingRecord ? 'Edit' : 'Add'} Compliance Record</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingRecord && (
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                  disabled={!!editingRecord}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf_contribution">PF Contribution (₹)</Label>
                <Input
                  id="pf_contribution"
                  type="number"
                  value={formData.pf_contribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, pf_contribution: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="esi_contribution">ESI Contribution (₹)</Label>
                <Input
                  id="esi_contribution"
                  type="number"
                  value={formData.esi_contribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, esi_contribution: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tds_deducted">TDS Deducted (₹)</Label>
                <Input
                  id="tds_deducted"
                  type="number"
                  value={formData.tds_deducted}
                  onChange={(e) => setFormData(prev => ({ ...prev, tds_deducted: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Optional remarks"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveComplianceMutation.isPending}>
                <Shield className="w-4 h-4 mr-2" />
                {saveComplianceMutation.isPending ? 'Saving...' : 'Save Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Compliance Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceRecords?.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {record.profiles?.first_name} {record.profiles?.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {record.profiles?.employee_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Month: {new Date(record.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(record)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">PF Contribution:</span>
                    <p className="font-medium">{formatCurrency(record.pf_contribution)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ESI Contribution:</span>
                    <p className="font-medium">{formatCurrency(record.esi_contribution)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">TDS Deducted:</span>
                    <p className="font-medium">{formatCurrency(record.tds_deducted)}</p>
                  </div>
                </div>
                
                {record.remarks && (
                  <div className="mt-3">
                    <span className="text-gray-600">Remarks:</span>
                    <p className="text-sm">{record.remarks}</p>
                  </div>
                )}
              </div>
            ))}
            
            {!complianceRecords?.length && (
              <div className="text-center py-8 text-gray-500">
                No compliance records found. Add one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceTracker;
