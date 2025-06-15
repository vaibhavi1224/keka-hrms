
import React from 'react';
import TeamStatsCards from './manager/TeamStatsCards';
import QuickActionsCard from './manager/QuickActionsCard';
import TeamPerformanceCard from './manager/TeamPerformanceCard';
import RecentActivitiesCard from './manager/RecentActivitiesCard';
import UpcomingEventsCard from './manager/UpcomingEventsCard';

const ManagerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your team's performance and manage daily operations</p>
      </div>

      {/* Team Stats */}
      <TeamStatsCards />

      {/* Quick Actions & Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard />
        <TeamPerformanceCard />
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivitiesCard />
        <UpcomingEventsCard />
      </div>
    </div>
  );
};

export default ManagerDashboard;
