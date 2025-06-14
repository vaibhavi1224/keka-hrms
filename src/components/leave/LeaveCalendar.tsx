
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LeaveCalendar = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Leave calendar view coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendar;
