
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Sparkles, TrendingUp, Users } from 'lucide-react';
import SmartFeedbackCenter from './SmartFeedbackCenter';

const PerformanceAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Performance Analytics & AI Tools</h2>
        <p className="text-gray-600 mt-1">Advanced analytics and AI-powered tools for performance management</p>
      </div>

      <Tabs defaultValue="ai-feedback" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-feedback" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Smart Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-feedback">
          <SmartFeedbackCenter />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-gray-600">Detailed performance analytics coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Insights</h3>
            <p className="text-gray-600">AI-powered insights and recommendations coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalytics;
