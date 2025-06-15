
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, Send, Clock } from 'lucide-react';
import { toast } from 'sonner';

const SelfReview = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  // Get active review cycles
  const { data: activeCycles = [] } = useQuery({
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

  // Get submitted self reviews
  const { data: submittedReviews = [] } = useQuery({
    queryKey: ['self-reviews', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('feedback_reviews')
        .select(`
          *,
          review_cycle:review_cycles(name, cycle_type)
        `)
        .eq('reviewer_id', profile.id)
        .eq('reviewee_id', profile.id)
        .eq('review_type', 'self')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      review_cycle_id: string;
      rating: number;
      feedback: string;
    }) => {
      if (!profile?.id) throw new Error('Profile not found');

      const { error } = await supabase
        .from('feedback_reviews')
        .insert({
          review_cycle_id: reviewData.review_cycle_id,
          reviewer_id: profile.id,
          reviewee_id: profile.id,
          review_type: 'self',
          rating: reviewData.rating,
          feedback: reviewData.feedback
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Self-review submitted successfully!');
      setSelectedCycle('');
      setRating('');
      setFeedback('');
      queryClient.invalidateQueries({ queryKey: ['self-reviews'] });
    },
    onError: (error) => {
      toast.error('Failed to submit review: ' + error.message);
    }
  });

  const handleSubmitReview = () => {
    if (!selectedCycle || !rating || !feedback.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitReviewMutation.mutate({
      review_cycle_id: selectedCycle,
      rating: parseInt(rating),
      feedback: feedback.trim()
    });
  };

  const getAvailableCycles = () => {
    const submittedCycleIds = submittedReviews.map(r => r.review_cycle_id);
    return activeCycles.filter(cycle => cycle && cycle.id && !submittedCycleIds.includes(cycle.id));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Submit New Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Submit Self Review</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getAvailableCycles().length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Review Cycles</h3>
              <p className="text-gray-600">There are no active review cycles available for self-review at the moment.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Cycle</label>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a review cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCycles().map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id || 'unknown'}>
                        {cycle.name} ({cycle.cycle_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Overall Self Rating</label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate your performance (1-5)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="1">1 - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Self Assessment</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback about your performance, achievements, challenges, and areas for improvement..."
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleSubmitReview}
                disabled={!selectedCycle || !rating || !feedback.trim() || submitReviewMutation.isPending}
                className="w-full"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Self Review'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Previous Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Self Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {submittedReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Your submitted self-reviews will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{review.review_cycle?.name || 'Unknown Cycle'}</h4>
                      <p className="text-sm text-gray-600">{review.review_cycle?.cycle_type || 'Unknown'} Review</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <Badge variant="outline">{review.rating}/5</Badge>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.feedback}</p>
                  <p className="text-xs text-gray-500">
                    Submitted on {new Date(review.submitted_at).toLocaleDateString()}
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

export default SelfReview;
