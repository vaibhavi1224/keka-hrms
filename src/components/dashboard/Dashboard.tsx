
import React from 'react';
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Employees',
      value: '248',
      icon: Users,
      trend: { value: 12, isPositive: true },
      color: 'blue' as const,
    },
    {
      title: 'Present Today',
      value: '234',
      icon: Clock,
      trend: { value: 5, isPositive: true },
      color: 'green' as const,
    },
    {
      title: 'Pending Leaves',
      value: '12',
      icon: Calendar,
      color: 'yellow' as const,
    },
    {
      title: 'Performance Score',
      value: '4.2',
      icon: TrendingUp,
      trend: { value: 8, isPositive: true },
      color: 'green' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your company today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[
              { user: 'Sarah Johnson', action: 'checked in', time: '9:15 AM', status: 'success' },
              { user: 'Mike Chen', action: 'requested leave', time: '8:45 AM', status: 'pending' },
              { user: 'Emily Davis', action: 'completed training', time: '8:30 AM', status: 'success' },
              { user: 'John Smith', action: 'late check-in', time: '10:20 AM', status: 'warning' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{activity.time}</p>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'success' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Add Employee', color: 'bg-blue-600 hover:bg-blue-700' },
              { name: 'Generate Payroll', color: 'bg-green-600 hover:bg-green-700' },
              { name: 'View Reports', color: 'bg-purple-600 hover:bg-purple-700' },
              { name: 'Manage Policies', color: 'bg-orange-600 hover:bg-orange-700' },
            ].map((action, index) => (
              <button
                key={index}
                className={`${action.color} text-white p-4 rounded-lg text-sm font-medium transition-colors duration-200`}
              >
                {action.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
