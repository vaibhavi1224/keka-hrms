
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TeamPerformanceCard = () => {
  const teamPerformance = [
    { name: 'Sarah Johnson', role: 'Senior Developer', performance: 4.8, tasks: 8, status: 'excellent' },
    { name: 'Mike Chen', role: 'Designer', performance: 4.5, tasks: 6, status: 'good' },
    { name: 'Emily Davis', role: 'Developer', performance: 4.2, tasks: 7, status: 'good' },
    { name: 'John Smith', role: 'QA Engineer', performance: 3.9, tasks: 5, status: 'average' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamPerformance.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{member.performance}/5</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  member.status === 'excellent' ? 'bg-green-100 text-green-800' :
                  member.status === 'good' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceCard;
