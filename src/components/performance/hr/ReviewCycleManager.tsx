
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';

const ReviewCycleManager = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cycle_type: '',
    start_date: '',
    end_date: ''
  });

  const { data: reviewCycles = [], isLoading } = useQuery({
    queryKey: ['review-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_cycles')
        .select(`
          *,
          created_by_profile:profiles!review_cycles_created_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createCycleMutation = useMutation({
    mutationFn: async (cycleData: typeof formData) => {
      if (!profile?.id) throw new Error('Profile not found');

      const { error } = await supabase
        .from('review_cycles')
        .insert({
          ...cycleData,
          created_by: profile.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review cycle created successfully!');
      setShowCreateForm(false);
      setFormData({ name: '', cycle_type: '', start_date: '', end_date: '' });
      queryClient.invalidateQueries({ queryKey: ['review-cycles'] });
    },
    onError: (error) => {
      toast.error('Failed to create cycle: ' + error.message);
    }
  });

  const closeCycleMutation = useMutation({
    mutationFn: async (cycleId: string) => {
      const { error } = await supabase
        .from('review_cycles')
        .update({ status: 'Completed' })
        .eq('id', cycleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review cycle closed successfully!');
      queryClient.invalidateQueries({ queryKey: ['review-cycles'] });
    },
    onError: (error) => {
      toast.error('Failed to close cycle: ' + error.message);
    }
  });

  const handleCreateCycle = () => {
    if (!formData.name || !formData.cycle_type || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    createCycleMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
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
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Review Cycles</h2>
          <p className="text-gray-600">Manage performance review cycles and timelines</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create New Cycle</span>
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Review Cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cycle Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 2025 Review"
                />
              </div>

              <div className="space-y-2">
                <Label>Cycle Type</Label>
                <Select value={formData.cycle_type} onValueChange={(value) => setFormData({ ...formData, cycle_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateCycle}
                disabled={createCycleMutation.isPending}
              >
                {createCycleMutation.isPending ? 'Creating...' : 'Create Cycle'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Cycles List */}
      <div className="space-y-4">
        {reviewCycles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Review Cycles</h3>
              <p className="text-gray-600">Create your first review cycle to start performance management.</p>
            </CardContent>
          </Card>
        ) : (
          reviewCycles.map((cycle) => (
            <Card key={cycle.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{cycle.name}</span>
                      <Badge className={getStatusColor(cycle.status)}>{cycle.status}</Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span>{cycle.cycle_type} Review</span>
                      <span>{new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}</span>
                      <span>Created by {cycle.created_by_profile?.first_name} {cycle.created_by_profile?.last_name}</span>
                    </div>
                  </div>
                  
                  {cycle.status === 'Active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeCycleMutation.mutate(cycle.id)}
                      disabled={closeCycleMutation.isPending}
                    >
                      Close Cycle
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewCycleManager;
