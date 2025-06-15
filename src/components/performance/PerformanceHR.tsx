
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, BarChart, Award, Settings } from 'lucide-react';
import ReviewCycleManager from './hr/ReviewCycleManager';
import PerformanceAnalytics from './hr/PerformanceAnalytics';
import AppraisalOverview from './hr/AppraisalOverview';
import PerformanceSettings from './hr/PerformanceSettings';

const PerformanceHR = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Management Hub</h1>
        <p className="text-gray-600 mt-1">Manage review cycles, analyze performance trends, and oversee organization-wide appraisals</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="cycles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cycles" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Review Cycles</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="appraisals" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Appraisals</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cycles">
          <ReviewCycleManager />
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="appraisals">
          <AppraisalOverview />
        </TabsContent>

        <TabsContent value="settings">
          <PerformanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceHR;
