
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HRPendingTasksProps {
  pendingInvitationsCount: number;
}

const HRPendingTasks = ({ pendingInvitationsCount }: HRPendingTasksProps) => {
  // Fetch real pending tasks data
  const { data: pendingTasksData } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: async () => {
      // Get pending leave requests
      const { data: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('status', 'pending');

      // Get employees with missing documents or incomplete profiles
      const { data: incompleteProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .or('first_name.is.null,last_name.is.null,department.is.null,designation.is.null');

      // Get draft payrolls
      const { data: draftPayrolls } = await supabase
        .from('payrolls')
        .select('*')
        .eq('status', 'draft');

      return {
        pendingLeaves: pendingLeaves?.length || 0,
        incompleteProfiles: incompleteProfiles?.length || 0,
        draftPayrolls: draftPayrolls?.length || 0
      };
    }
  });

  const pendingTasks = [
    { 
      task: `Review ${pendingTasksData?.pendingLeaves || 0} pending leave requests`, 
      priority: 'high', 
      count: pendingTasksData?.pendingLeaves || 0 
    },
    { 
      task: `Process ${pendingTasksData?.draftPayrolls || 0} draft payrolls`, 
      priority: 'medium', 
      count: pendingTasksData?.draftPayrolls || 0 
    },
    { 
      task: `Process ${pendingInvitationsCount} pending invitations`, 
      priority: 'high', 
      count: pendingInvitationsCount 
    },
    { 
      task: `Update ${pendingTasksData?.incompleteProfiles || 0} incomplete employee records`, 
      priority: 'low', 
      count: pendingTasksData?.incompleteProfiles || 0 
    },
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
