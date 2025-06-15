
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecentActivitiesCard = () => {
  const recentActivities = [
    { employee: 'Sarah Johnson', action: 'submitted leave request', time: '2 hours ago', type: 'leave' },
    { employee: 'Mike Chen', action: 'completed project milestone', time: '4 hours ago', type: 'achievement' },
    { employee: 'Emily Davis', action: 'checked in late', time: '1 day ago', type: 'attendance' },
    { employee: 'John Smith', action: 'requested overtime approval', time: '2 days ago', type: 'overtime' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Team Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {activity.employee.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.employee}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{activity.time}</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  activity.type === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                  activity.type === 'achievement' ? 'bg-green-100 text-green-800' :
                  activity.type === 'attendance' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesCard;
