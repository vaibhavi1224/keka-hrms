
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WeeklySummary = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">38.5 hrs</div>
            <div className="text-sm text-gray-600">Hours Worked</div>
            <div className="text-xs text-blue-600 mt-1">1.5 hrs remaining</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">5/5</div>
            <div className="text-sm text-gray-600">Days Present</div>
            <div className="text-xs text-green-600 mt-1">Perfect attendance</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
            <div className="text-xs text-purple-600 mt-1">Above target</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Work Schedule</div>
          <div className="text-xs text-gray-600 mt-1">
            Monday - Friday: 9:00 AM - 5:00 PM (40 hours/week)
          </div>
          <div className="text-xs text-gray-600">
            Saturday - Sunday: Holiday
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;
