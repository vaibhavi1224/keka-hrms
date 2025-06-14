
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RecentAnnouncements = () => {
  const recentAnnouncements = [
    { title: 'New Health Insurance Policy', date: '2 days ago', type: 'policy' },
    { title: 'Office Maintenance - 15th Dec', date: '1 week ago', type: 'notice' },
    { title: 'Holiday Calendar Updated', date: '2 weeks ago', type: 'info' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAnnouncements.map((announcement, index) => (
            <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  announcement.type === 'policy' ? 'bg-red-500' :
                  announcement.type === 'notice' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{announcement.title}</p>
                  <p className="text-sm text-gray-600">{announcement.date}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Read</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAnnouncements;
