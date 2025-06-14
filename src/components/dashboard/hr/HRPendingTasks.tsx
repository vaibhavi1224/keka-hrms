
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HRPendingTasksProps {
  pendingInvitationsCount: number;
}

const HRPendingTasks = ({ pendingInvitationsCount }: HRPendingTasksProps) => {
  const pendingTasks = [
    { task: 'Review 8 pending leave requests', priority: 'high', count: 8 },
    { task: 'Approve overtime for 12 employees', priority: 'medium', count: 12 },
    { task: `Process ${pendingInvitationsCount} pending invitations`, priority: 'high', count: pendingInvitationsCount },
    { task: 'Update 5 employee records', priority: 'low', count: 5 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-sm font-medium text-gray-900">{task.task}</span>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {task.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HRPendingTasks;
