
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UpcomingEventsCard = () => {
  const upcomingEvents = [
    { event: 'Team Standup', time: '9:00 AM', type: 'meeting' },
    { event: 'Performance Review - Sarah', time: '2:00 PM', type: 'review' },
    { event: 'Project Deadline', time: 'Tomorrow', type: 'deadline' },
    { event: 'Team Building Event', time: 'Friday', type: 'event' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'meeting' ? 'bg-blue-500' :
                  event.type === 'review' ? 'bg-purple-500' :
                  event.type === 'deadline' ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-600">{event.time}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;
