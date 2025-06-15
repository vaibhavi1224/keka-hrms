
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Brain, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceInsight {
  id: string;
  insight_type: string;
  insight_title: string;
  insight_summary: string;
  supporting_data: any;
  confidence_score: number;
  generated_at: string;
}

export const PerformanceInsights = () => {
  const { user } = useAuth();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['performance-insights', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('performance_insights')
        .select('*')
        .eq('employee_id', user.id)
        .eq('is_active', true)
        .order('generated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as PerformanceInsight[];
    },
    enabled: !!user?.id
  });

  const generateNewInsights = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('performance-insights', {
        body: { employeeId: user.id, periodMonths: 6 }
      });

      if (error) throw error;
      
      // Refresh the insights
      window.location.reload();
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend_analysis':
        return <TrendingUp className="h-5 w-5" />;
      case 'strength_highlight':
        return <Award className="h-5 w-5" />;
      case 'improvement_suggestion':
        return <Target className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend_analysis':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'strength_highlight':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'improvement_suggestion':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewInsights}
            className="text-xs"
          >
            Generate New Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights || insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No insights available yet.</p>
            <p className="text-sm text-gray-400">Generate insights to see AI-powered analysis of your performance.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${getInsightColor(insight.insight_type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{insight.insight_title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(insight.confidence_score * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm">{insight.insight_summary}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Generated {new Date(insight.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
