
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Star, MessageSquare, TrendingUp } from 'lucide-react';
import GoalsTracker from './employee/GoalsTracker';
import SelfReview from './employee/SelfReview';
import FeedbackHistory from './employee/FeedbackHistory';
import PerformanceTrends from './employee/PerformanceTrends';

const PerformanceEmployee = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
        <p className="text-gray-600 mt-1">Track your goals, submit reviews, and view your performance history</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>My Goals</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Self Review</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <GoalsTracker />
        </TabsContent>

        <TabsContent value="review">
          <SelfReview />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackHistory />
        </TabsContent>

        <TabsContent value="trends">
          <PerformanceTrends />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceEmployee;
