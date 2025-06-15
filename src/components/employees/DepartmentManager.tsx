
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import type { Department } from '@/types/employee';

const DepartmentManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const createDepartmentMutation = useMutation({
    mutationFn: async (department: { name: string; description: string }) => {
      const { error } = await supabase
        .from('departments')
        .insert([department]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsAddingDepartment(false);
      setFormData({ name: '', description: '' });
      toast({ title: 'Department created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating department', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name: string; description: string }) => {
      const { error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
      toast({ title: 'Department updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating department', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting department', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ 
        id: editingDepartment.id, 
        ...formData 
      });
    } else {
      createDepartmentMutation.mutate(formData);
    }
  };

  const startEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({ name: department.name, description: department.description || '' });
    setIsAddingDepartment(false);
  };

  const cancelEdit = () => {
    setEditingDepartment(null);
    setIsAddingDepartment(false);
    setFormData({ name: '', description: '' });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading departments...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Department Management
          </CardTitle>
          {canCreate('departments') && (
            <Button 
              onClick={() => setIsAddingDepartment(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(isAddingDepartment || editingDepartment) && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
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
              <div className="flex gap-2">
                <Button type="submit" disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}>
                  {editingDepartment ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {departments.map((department) => (
            <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{department.name}</h3>
                {department.description && (
                  <p className="text-sm text-gray-600">{department.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {canUpdate('departments') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(department)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {canDelete('departments') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteDepartmentMutation.mutate(department.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentManager;
