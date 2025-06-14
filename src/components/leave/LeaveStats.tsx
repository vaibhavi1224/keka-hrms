
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  canManageRequests: boolean;
}

const LeaveStats = ({ stats, canManageRequests }: LeaveStatsProps) => {
  const statItems = [
    { 
      title: canManageRequests ? 'Total Requests' : 'My Total Requests', 
      count: stats.total, 
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      title: 'Pending', 
      count: stats.pending, 
      color: 'bg-yellow-50 text-yellow-600' 
    },
    { 
      title: 'Approved', 
      count: stats.approved, 
      color: 'bg-green-50 text-green-600' 
    },
    { 
      title: 'Rejected', 
      count: stats.rejected, 
      color: 'bg-red-50 text-red-600' 
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeaveStats;
