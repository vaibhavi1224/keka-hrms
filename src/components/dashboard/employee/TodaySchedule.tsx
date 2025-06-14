
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TodaySchedule = () => {
  const todaySchedule = [
    { time: '9:00 AM', task: 'Daily Standup', type: 'meeting', status: 'upcoming' },
    { time: '10:30 AM', task: 'Code Review', type: 'work', status: 'upcoming' },
    { time: '2:00 PM', task: 'Client Presentation', type: 'meeting', status: 'upcoming' },
    { time: '4:00 PM', task: 'Team Planning', type: 'meeting', status: 'upcoming' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaySchedule.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div>
                  <p className="font-medium text-gray-900">{item.task}</p>
                  <p className="text-sm text-gray-600">{item.time}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                item.type === 'meeting' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;
