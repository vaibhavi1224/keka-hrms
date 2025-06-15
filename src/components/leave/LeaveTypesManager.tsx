
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  max_leaves_per_year: number;
  accrual_rate: number;
  carry_forward: boolean;
  encashable: boolean;
  is_active: boolean;
}

const LeaveTypesManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_leaves_per_year: 0,
    accrual_rate: 0,
    carry_forward: false,
    encashable: false,
    is_active: true
  });

  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: leaveTypes = [], isLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as LeaveType[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('leave_types')
        .insert([{ ...data, created_by: profile?.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type created successfully');
      resetForm();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create leave type');
      console.error('Error creating leave type:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('leave_types')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type updated successfully');
      resetForm();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update leave type');
      console.error('Error updating leave type:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type deactivated successfully');
    },
    onError: (error) => {
      toast.error('Failed to deactivate leave type');
      console.error('Error deactivating leave type:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      max_leaves_per_year: 0,
      accrual_rate: 0,
      carry_forward: false,
      encashable: false,
      is_active: true
    });
    setEditingType(null);
  };

  const handleEdit = (leaveType: LeaveType) => {
    setEditingType(leaveType);
    setFormData({
      name: leaveType.name,
      description: leaveType.description || '',
      max_leaves_per_year: leaveType.max_leaves_per_year,
      accrual_rate: leaveType.accrual_rate,
      carry_forward: leaveType.carry_forward,
      encashable: leaveType.encashable,
      is_active: leaveType.is_active
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (profile?.role !== 'hr') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Leave Types Management</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Leave Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'Edit Leave Type' : 'Add New Leave Type'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_leaves">Max Leaves per Year</Label>
                  <Input
                    id="max_leaves"
                    type="number"
                    value={formData.max_leaves_per_year}
                    onChange={(e) => setFormData({ ...formData, max_leaves_per_year: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accrual_rate">Monthly Accrual Rate</Label>
                  <Input
                    id="accrual_rate"
                    type="number"
                    step="0.01"
                    value={formData.accrual_rate}
                    onChange={(e) => setFormData({ ...formData, accrual_rate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="carry_forward"
                    checked={formData.carry_forward}
                    onCheckedChange={(checked) => setFormData({ ...formData, carry_forward: checked })}
                  />
                  <Label htmlFor="carry_forward">Allow Carry Forward</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="encashable"
                    checked={formData.encashable}
                    onCheckedChange={(checked) => setFormData({ ...formData, encashable: checked })}
                  />
                  <Label htmlFor="encashable">Encashable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingType ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading leave types...</div>
        ) : (
          <div className="space-y-4">
            {leaveTypes.map((leaveType) => (
              <div key={leaveType.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{leaveType.name}</h3>
                    {leaveType.description && (
                      <p className="text-sm text-gray-600 mt-1">{leaveType.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <span>Max per year: {leaveType.max_leaves_per_year}</span>
                      <span>Monthly accrual: {leaveType.accrual_rate}</span>
                      <span>Carry forward: {leaveType.carry_forward ? 'Yes' : 'No'}</span>
                      <span>Encashable: {leaveType.encashable ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(leaveType)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {leaveType.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(leaveType.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {!leaveType.is_active && (
                  <div className="mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Inactive</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveTypesManager;
