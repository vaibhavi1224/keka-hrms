
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FeedbackFormData {
  feedback_type: string;
  feedback_text: string;
  rating?: number;
  review_period_start: string;
  review_period_end: string;
}

export const FeedbackForm = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue } = useForm<FeedbackFormData>();

  const feedbackTypes = [
    { value: 'self_review', label: 'Self Review' },
    { value: 'manager_review', label: 'Manager Review' },
    { value: 'peer_review', label: 'Peer Review' },
    { value: '360_feedback', label: '360° Feedback' }
  ];

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('performance_feedback')
        .insert({
          employee_id: user.id,
          feedback_type: data.feedback_type,
          feedback_text: data.feedback_text,
          rating: data.rating,
          review_period_start: data.review_period_start,
          review_period_end: data.review_period_end,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been recorded successfully."
      });

      reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Submit Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="feedback_type">Feedback Type</Label>
            <Select onValueChange={(value) => setValue('feedback_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="review_period_start">Review Period Start</Label>
              <Input
                id="review_period_start"
                type="date"
                {...register('review_period_start', { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="review_period_end">Review Period End</Label>
              <Input
                id="review_period_end"
                type="date"
                {...register('review_period_end', { required: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rating">Rating (1-5, Optional)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              {...register('rating', { valueAsNumber: true, min: 1, max: 5 })}
              placeholder="Rate from 1 to 5"
            />
          </div>

          <div>
            <Label htmlFor="feedback_text">Feedback</Label>
            <Textarea
              id="feedback_text"
              {...register('feedback_text', { required: true })}
              placeholder="Provide detailed feedback about performance, strengths, areas for improvement, etc."
              rows={6}
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
