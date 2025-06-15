
import React from 'react';
import { Users, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TeamStatsCards = () => {
  const teamStats = [
    { label: 'Team Members', value: '12', change: '+1', icon: Users, color: 'blue' },
    { label: 'Present Today', value: '11', change: '92%', icon: CheckCircle, color: 'green' },
    { label: 'Pending Approvals', value: '5', change: '3 urgent', icon: AlertTriangle, color: 'orange' },
    { label: 'Team Performance', value: '4.2/5', change: '+0.3', icon: Star, color: 'purple' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {teamStats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
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

export default TeamStatsCards;
