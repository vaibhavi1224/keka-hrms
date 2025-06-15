
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Award, User, Calendar, Calculator } from 'lucide-react';
import { toast } from 'sonner';

const AppraisalCenter = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [appraisalData, setAppraisalData] = useState({
    remarks: '',
    promotion_eligible: false,
    salary_increment: ''
  });

  // Get team members with their feedback data
  const { data: teamAppraisals = [], isLoading } = useQuery({
    queryKey: ['team-appraisals', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('manager_id', profile.id)
        .eq('is_active', true);

      if (teamError) throw teamError;

      // Get their appraisals and feedback
      const appraisalPromises = (teamMembers || []).map(async (member) => {
        // Get existing appraisal
        const { data: appraisal } = await supabase
          .from('appraisals')
          .select('*')
          .eq('employee_id', member.id)
          .single();

        // Get feedback summary
        const { data: feedback } = await supabase
          .from('feedback_reviews')
          .select('review_type, rating')
          .eq('reviewee_id', member.id);

        // Calculate average rating
        const avgRating = feedback && feedback.length > 0
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
          : 0;

        return {
          ...member,
          appraisal,
          avgRating: Math.round(avgRating * 100) / 100,
          feedbackCount: feedback?.length || 0,
          feedback: feedback || []
        };
      });

      return Promise.all(appraisalPromises);
    },
    enabled: !!profile?.id
  });

  const createAppraisalMutation = useMutation({
    mutationFn: async (data: { employeeId: string; finalRating: number }) => {
      if (!profile?.id) throw new Error('Profile not found');

      const { error } = await supabase
        .from('appraisals')
        .upsert({
          employee_id: data.employeeId,
          review_cycle_id: 'current-cycle', // This should be dynamic based on active cycle
          final_rating: data.finalRating,
          remarks: appraisalData.remarks,
          promotion_eligible: appraisalData.promotion_eligible,
          salary_increment: appraisalData.salary_increment ? parseFloat(appraisalData.salary_increment) : null,
          decided_by: profile.id,
          decided_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Appraisal submitted successfully!');
      setSelectedEmployee('');
      setAppraisalData({ remarks: '', promotion_eligible: false, salary_increment: '' });
      queryClient.invalidateQueries({ queryKey: ['team-appraisals'] });
    },
    onError: (error) => {
      toast.error('Failed to submit appraisal: ' + error.message);
    }
  });

  const handleSubmitAppraisal = (employeeId: string, finalRating: number) => {
    if (!appraisalData.remarks.trim()) {
      toast.error('Please provide remarks for the appraisal');
      return;
    }

    createAppraisalMutation.mutate({ employeeId, finalRating });
  };

  const getStatusColor = (avgRating: number) => {
    if (avgRating >= 4.5) return 'bg-green-100 text-green-800';
    if (avgRating >= 3.5) return 'bg-blue-100 text-blue-800';
    if (avgRating >= 2.5) return 'bg-yellow-100 text-yellow-800';
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
        <h2 className="text-xl font-semibold">Appraisal Center</h2>
        <p className="text-gray-600">Review feedback and finalize appraisals for your team members</p>
      </div>

      {/* Team Appraisals */}
      <div className="space-y-4">
        {teamAppraisals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members</h3>
              <p className="text-gray-600">Team member appraisals will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          teamAppraisals.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{member.first_name} {member.last_name}</span>
                      {member.avgRating > 0 && (
                        <Badge className={getStatusColor(member.avgRating)}>
                          Avg: {member.avgRating}/5.0
                        </Badge>
                      )}
                      {member.appraisal && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Appraised
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span>Employee ID: {member.employee_id}</span>
                      <span className="flex items-center space-x-1">
                        <Calculator className="w-4 h-4" />
                        <span>{member.feedbackCount} feedback(s) received</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Feedback Summary */}
                {member.feedback.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Feedback Summary</h4>
                    <div className="space-y-2">
                      {member.feedback.map((fb, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="capitalize">{fb.review_type} Review</span>
                          <Badge variant="outline">{fb.rating}/5</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appraisal Form */}
                {selectedEmployee === member.id ? (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium text-gray-900">Finalize Appraisal</h4>
                    
                    <div className="space-y-2">
                      <Label>Final Rating: {member.avgRating}/5.0</Label>
                      <p className="text-sm text-gray-600">
                        Calculated from all feedback received
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Textarea
                        value={appraisalData.remarks}
                        onChange={(e) => setAppraisalData({ ...appraisalData, remarks: e.target.value })}
                        placeholder="Provide detailed appraisal remarks..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={appraisalData.promotion_eligible}
                        onCheckedChange={(checked) => setAppraisalData({ ...appraisalData, promotion_eligible: checked })}
                      />
                      <Label>Eligible for Promotion</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Salary Increment (₹)</Label>
                      <Input
                        type="number"
                        value={appraisalData.salary_increment}
                        onChange={(e) => setAppraisalData({ ...appraisalData, salary_increment: e.target.value })}
                        placeholder="Enter increment amount"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleSubmitAppraisal(member.id, member.avgRating)}
                        disabled={createAppraisalMutation.isPending}
                      >
                        {createAppraisalMutation.isPending ? 'Submitting...' : 'Submit Appraisal'}
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedEmployee('')}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center border-t pt-4">
                    <div>
                      {member.appraisal ? (
                        <div className="text-sm text-gray-600">
                          <p>Appraisal completed on {new Date(member.appraisal.decided_at).toLocaleDateString()}</p>
                          <p>Final Rating: {member.appraisal.final_rating}/5.0</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Appraisal pending</p>
                      )}
                    </div>
                    
                    {!member.appraisal && member.feedbackCount > 0 && (
                      <Button 
                        onClick={() => setSelectedEmployee(member.id)}
                        size="sm"
                      >
                        Start Appraisal
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AppraisalCenter;
