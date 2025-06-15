
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import type { Designation, Department } from '@/types/employee';

const DesignationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [isAddingDesignation, setIsAddingDesignation] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    department_id: '', 
    level: 1 
  });

  const { data: designations = [], isLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const { data: departments = [] } = useQuery({
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

  const createDesignationMutation = useMutation({
    mutationFn: async (designation: typeof formData) => {
      const { error } = await supabase
        .from('designations')
        .insert([{
          ...designation,
          department_id: designation.department_id || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      setIsAddingDesignation(false);
      setFormData({ name: '', description: '', department_id: '', level: 1 });
      toast({ title: 'Designation created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating designation', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const updateDesignationMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & typeof formData) => {
      const { error } = await supabase
        .from('designations')
        .update({
          ...updates,
          department_id: updates.department_id || null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      setEditingDesignation(null);
      setFormData({ name: '', description: '', department_id: '', level: 1 });
      toast({ title: 'Designation updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating designation', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const deleteDesignationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('designations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast({ title: 'Designation deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting designation', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDesignation) {
      updateDesignationMutation.mutate({ 
        id: editingDesignation.id, 
        ...formData 
      });
    } else {
      createDesignationMutation.mutate(formData);
    }
  };

  const startEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setFormData({ 
      name: designation.name, 
      description: designation.description || '',
      department_id: designation.department_id || '',
      level: designation.level
    });
    setIsAddingDesignation(false);
  };

  const cancelEdit = () => {
    setEditingDesignation(null);
    setIsAddingDesignation(false);
    setFormData({ name: '', description: '', department_id: '', level: 1 });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading designations...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Designation Management
          </CardTitle>
          {canCreate('designations') && (
            <Button 
              onClick={() => setIsAddingDesignation(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Designation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(isAddingDesignation || editingDesignation) && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Designation Name</Label>
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
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department_id} 
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createDesignationMutation.isPending || updateDesignationMutation.isPending}>
                  {editingDesignation ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {designations.map((designation) => {
            const department = departments.find(d => d.id === designation.department_id);
            return (
              <div key={designation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{designation.name}</h3>
                  <div className="text-sm text-gray-600">
                    <p>Level: {designation.level}</p>
                    {department && <p>Department: {department.name}</p>}
                    {designation.description && <p>{designation.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {canUpdate('designations') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(designation)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {canDelete('designations') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDesignationMutation.mutate(designation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignationManager;
