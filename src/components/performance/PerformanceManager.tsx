
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, MessageSquare, BarChart } from 'lucide-react';
import TeamGoalsManager from './manager/TeamGoalsManager';
import TeamFeedback from './manager/TeamFeedback';
import TeamPerformanceOverview from './manager/TeamPerformanceOverview';
import AppraisalCenter from './manager/AppraisalCenter';

const PerformanceManager = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Performance Management</h1>
        <p className="text-gray-600 mt-1">Manage goals, conduct reviews, and track your team's performance</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Team Goals</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="appraisal" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Appraisals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TeamPerformanceOverview />
        </TabsContent>

        <TabsContent value="goals">
          <TeamGoalsManager />
        </TabsContent>

        <TabsContent value="feedback">
          <TeamFeedback />
        </TabsContent>

        <TabsContent value="appraisal">
          <AppraisalCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceManager;
