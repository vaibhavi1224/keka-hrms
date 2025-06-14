
import React from 'react';
import { Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PersonalStats = () => {
  const personalStats = [
    { label: 'Hours This Week', value: '38.5', target: '40', icon: Clock, color: 'blue' },
    { label: 'Leave Balance', value: '12', unit: 'days', icon: Calendar, color: 'green' },
    { label: 'This Month Salary', value: '$4,250', status: 'processed', icon: DollarSign, color: 'yellow' },
    { label: 'Performance Score', value: '4.2/5', change: '+0.2', icon: TrendingUp, color: 'purple' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {personalStats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                    {stat.unit && <span className="text-sm text-gray-600 ml-1">{stat.unit}</span>}
                  </p>
                  {stat.target && (
                    <p className="text-sm text-gray-500 mt-1">Target: {stat.target}</p>
                  )}
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  )}
                  {stat.status && (
                    <p className="text-sm text-blue-600 mt-1">{stat.status}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PersonalStats;
