
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User } from 'lucide-react';

const FeedbackHistory = () => {
  const { profile } = useProfile();

  const { data: feedbackHistory = [], isLoading } = useQuery({
    queryKey: ['feedback-history', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('feedback_reviews')
        .select(`
          *,
          reviewer:profiles!feedback_reviews_reviewer_id_fkey(first_name, last_name),
          review_cycle:review_cycles(name, cycle_type)
        `)
        .eq('reviewee_id', profile.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const { data: appraisalHistory = [] } = useQuery({
    queryKey: ['appraisal-history', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          *,
          decided_by_profile:profiles!appraisals_decided_by_fkey(first_name, last_name),
          review_cycle:review_cycles(name, cycle_type)
        `)
        .eq('employee_id', profile.id)
        .order('decided_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const getReviewTypeColor = (type: string) => {
    switch (type) {
      case 'self': return 'bg-blue-100 text-blue-800';
      case 'peer': return 'bg-green-100 text-green-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'hr': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
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
      {/* Appraisal Results */}
      {appraisalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Appraisal Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appraisalHistory.map((appraisal) => (
                <div key={appraisal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{appraisal.review_cycle?.name}</h4>
                      <p className="text-sm text-gray-600">{appraisal.review_cycle?.cycle_type} Appraisal</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.round(appraisal.final_rating || 0))}
                      </div>
                      <Badge variant="outline">{appraisal.final_rating}/5</Badge>
                    </div>
                  </div>
                  
                  {appraisal.remarks && (
                    <p className="text-gray-700">{appraisal.remarks}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {appraisal.promotion_eligible && (
                      <Badge className="bg-green-100 text-green-800">Promotion Eligible</Badge>
                    )}
                    {appraisal.salary_increment && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Salary Increment: ₹{appraisal.salary_increment}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Decided by {appraisal.decided_by_profile?.first_name} {appraisal.decided_by_profile?.last_name} on {new Date(appraisal.decided_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Feedback History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
              <p className="text-gray-600">Feedback from your reviews will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackHistory.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{feedback.review_cycle?.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          {feedback.review_type === 'self' ? 'Self Review' : 
                           `${feedback.reviewer?.first_name} ${feedback.reviewer?.last_name}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getReviewTypeColor(feedback.review_type)}>
                        {feedback.review_type.charAt(0).toUpperCase() + feedback.review_type.slice(1)}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {renderStars(feedback.rating)}
                      </div>
                      <Badge variant="outline">{feedback.rating}/5</Badge>
                    </div>
                  </div>
                  <p className="text-gray-700">{feedback.feedback}</p>
                  <p className="text-xs text-gray-500">
                    Submitted on {new Date(feedback.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackHistory;
