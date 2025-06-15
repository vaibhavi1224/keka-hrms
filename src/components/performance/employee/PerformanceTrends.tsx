
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

const PerformanceTrends = () => {
  const { profile } = useProfile();

  const { data: performanceTrends = [], isLoading } = useQuery({
    queryKey: ['performance-trends', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          final_rating,
          review_cycle:review_cycles(name, cycle_type, start_date)
        `)
        .eq('employee_id', profile.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => ({
        cycle: item.review_cycle?.name || 'Unknown',
        rating: parseFloat(String(item.final_rating || '0')),
        date: item.review_cycle?.start_date
      }));
    },
    enabled: !!profile?.id
  });

  const { data: goalStats = [] } = useQuery({
    queryKey: ['goal-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('goals_okrs')
        .select('status, goal_type')
        .eq('employee_id', profile.id);

      if (error) throw error;
      
      // Group by status
      const statusCounts = (data || []).reduce((acc: any, goal) => {
        acc[goal.status] = (acc[goal.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number
      }));
    },
    enabled: !!profile?.id
  });

  const { data: feedbackStats = [] } = useQuery({
    queryKey: ['feedback-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('feedback_reviews')
        .select('review_type, rating')
        .eq('reviewee_id', profile.id);

      if (error) throw error;
      
      // Group by review type and calculate average
      const typeAverage = (data || []).reduce((acc: any, review) => {
        if (!acc[review.review_type]) {
          acc[review.review_type] = { sum: 0, count: 0 };
        }
        acc[review.review_type].sum += review.rating;
        acc[review.review_type].count += 1;
        return acc;
      }, {});

      return Object.entries(typeAverage).map(([type, stats]: [string, any]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        average: Math.round((stats.sum / stats.count) * 100) / 100
      }));
    },
    enabled: !!profile?.id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Rating Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Performance Rating Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceTrends.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
              <p className="text-gray-600">Your performance trends will appear here after appraisals.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cycle" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Completion Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Goal Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goalStats.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No goals data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={goalStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Feedback Ratings by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Average Ratings by Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackStats.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No feedback data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={feedbackStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceTrends;
