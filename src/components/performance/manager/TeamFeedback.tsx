
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const TeamFeedback = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  // Get active review cycles
  const { data: reviewCycles = [] } = useQuery({
    queryKey: ['active-review-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_cycles')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Get team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('manager_id', profile.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Get team feedback
  const { data: teamFeedback = [], isLoading } = useQuery({
    queryKey: ['team-feedback', profile?.id, selectedCycle],
    queryFn: async () => {
      if (!profile?.id) return [];

      let query = supabase
        .from('feedback_reviews')
        .select(`
          *,
          reviewee:profiles!feedback_reviews_reviewee_id_fkey(first_name, last_name, employee_id),
          review_cycle:review_cycles(name, cycle_type)
        `)
        .eq('reviewer_id', profile.id)
        .order('submitted_at', { ascending: false });

      if (selectedCycle) {
        query = query.eq('review_cycle_id', selectedCycle);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id || !selectedCycle || !selectedEmployee || !feedback || rating === 0) {
        throw new Error('Please fill in all required fields');
      }

      const { error } = await supabase
        .from('feedback_reviews')
        .insert({
          review_cycle_id: selectedCycle,
          reviewer_id: profile.id,
          reviewee_id: selectedEmployee,
          review_type: 'manager',
          rating,
          feedback
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Feedback submitted successfully!');
      setSelectedEmployee('');
      setFeedback('');
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ['team-feedback'] });
    },
    onError: (error) => {
      toast.error('Failed to submit feedback: ' + error.message);
    }
  });

  const handleSubmitFeedback = () => {
    submitFeedbackMutation.mutate();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-blue-100 text-blue-800';
    if (rating >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
      <div>
        <h2 className="text-xl font-semibold">Team Feedback</h2>
        <p className="text-gray-600">Provide feedback and ratings for your team members</p>
      </div>

      {/* Submit Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Submit Manager Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Cycle</label>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select review cycle" />
                </SelectTrigger>
                <SelectContent>
                  {reviewCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name} ({cycle.cycle_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team Member</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating (1-5)</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg transition-colors ${
                    star <= rating ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Star className="w-6 h-6" fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback on performance, achievements, and areas for improvement..."
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSubmitFeedback}
            disabled={submitFeedbackMutation.isPending || !selectedCycle || !selectedEmployee || !feedback || rating === 0}
          >
            {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filter by Review Cycle:</label>
        <Select value={selectedCycle} onValueChange={setSelectedCycle}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All cycles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All cycles</SelectItem>
            {reviewCycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                {cycle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feedback History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Submitted Feedback</h3>
        
        {teamFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Submitted</h3>
              <p className="text-gray-600">Start providing feedback for your team members during active review cycles.</p>
            </CardContent>
          </Card>
        ) : (
          teamFeedback.map((feedbackItem) => (
            <Card key={feedbackItem.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{feedbackItem.reviewee?.first_name} {feedbackItem.reviewee?.last_name}</span>
                      <Badge className={getRatingColor(feedbackItem.rating)}>
                        {feedbackItem.rating}/5
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{feedbackItem.review_cycle?.name}</span>
                      </span>
                      <span>Submitted: {new Date(feedbackItem.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{feedbackItem.feedback}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamFeedback;
