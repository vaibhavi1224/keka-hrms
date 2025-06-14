
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PerformanceMetrics = () => {
  const performanceMetrics = [
    { metric: 'Tasks Completed', value: '24', target: '25', percentage: 96 },
    { metric: 'Attendance Rate', value: '98%', target: '95%', percentage: 100 },
    { metric: 'Training Progress', value: '3/4', target: '4', percentage: 75 },
    { metric: 'Goal Achievement', value: '85%', target: '80%', percentage: 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Performance This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                <span className="text-sm text-gray-600">{metric.value} / {metric.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metric.percentage >= 100 ? 'bg-green-500' :
                    metric.percentage >= 80 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
