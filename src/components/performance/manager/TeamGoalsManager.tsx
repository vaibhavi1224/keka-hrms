import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

const TeamGoalsManager = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    goal_type: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    weightage: 50
  });

  // Get team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Debug
      console.log('Manager ID:', profile.id);
      console.log('Manager role:', profile.role);
      console.log('Manager department:', profile.department);

      // First try to get direct reports (employees directly managed by this manager)
      const { data: directReports, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('manager_id', profile.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching direct reports:', error);
        throw error;
      }
      
      console.log('Direct reports fetched:', directReports?.length || 0);
      
      // If direct reports found, return them
      if (directReports && directReports.length > 0) {
        return directReports;
      }
      
      // Second fallback: If no direct reports found and manager has a department, get all employees in that department
      if (profile.department) {
        console.log('No direct reports found, fetching department members');
        
        const { data: departmentMembers, error: deptError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, employee_id')
          .eq('department', profile.department)
          .eq('is_active', true)
          .neq('id', profile.id); // Exclude the manager themselves
          
        if (deptError) {
          console.error('Error fetching department members:', deptError);
          throw deptError;
        }
        
        console.log('Department members fetched:', departmentMembers?.length || 0);
        
        // If department members found, return them
        if (departmentMembers && departmentMembers.length > 0) {
          return departmentMembers;
        }
      }
      
      // Final fallback: Get all employees with role 'employee'
      console.log('No team or department members found, fetching all employees');
      
      const { data: allEmployees, error: allError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('role', 'employee')
        .eq('is_active', true)
        .neq('id', profile.id);
        
      if (allError) {
        console.error('Error fetching all employees:', allError);
        throw allError;
      }
      
      console.log('All employees fetched:', allEmployees?.length || 0);
      return allEmployees || [];
    },
    enabled: !!profile?.id
  });

  // Get team goals
  const { data: teamGoals = [], isLoading } = useQuery({
    queryKey: ['team-goals', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('goals_okrs')
        .select(`
          *,
          employee:profiles!goals_okrs_employee_id_fkey(first_name, last_name, employee_id),
          created_by_profile:profiles!goals_okrs_created_by_fkey(first_name, last_name)
        `)
        .eq('created_by', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: typeof formData) => {
      if (!profile?.id) throw new Error('Profile not found');

      const { error } = await supabase
        .from('goals_okrs')
        .insert({
          ...goalData,
          created_by: profile.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Goal created successfully!');
      setShowCreateForm(false);
      setFormData({
        employee_id: '',
        goal_type: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        weightage: 50
      });
      queryClient.invalidateQueries({ queryKey: ['team-goals'] });
    },
    onError: (error) => {
      toast.error('Failed to create goal: ' + error.message);
    }
  });

  const handleCreateGoal = () => {
    if (!formData.employee_id || !formData.goal_type || !formData.title || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    createGoalMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Team Goals Management</h2>
          <p className="text-gray-600">Create and manage goals for your team members</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </Button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Member</Label>
                <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} ({member.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={formData.goal_type} onValueChange={(value) => setFormData({ ...formData, goal_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OKR">OKR</SelectItem>
                    <SelectItem value="KRA">KRA</SelectItem>
                    <SelectItem value="Personal Goal">Personal Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Goal Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter goal title"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the goal objectives and success criteria"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Weightage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weightage}
                  onChange={(e) => setFormData({ ...formData, weightage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateGoal}
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {teamGoals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Created</h3>
              <p className="text-gray-600">Create goals for your team members to track their performance.</p>
            </CardContent>
          </Card>
        ) : (
          teamGoals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{goal.title}</span>
                      <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                      <Badge variant="outline">{goal.goal_type}</Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{goal.employee?.first_name} {goal.employee?.last_name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}</span>
                      </span>
                      <span>Weight: {goal.weightage}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {goal.description && (
                <CardContent>
                  <p className="text-gray-700">{goal.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamGoalsManager;
