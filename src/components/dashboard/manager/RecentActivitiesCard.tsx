
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Clock } from 'lucide-react';

const RecentActivitiesCard = () => {
  const { profile } = useProfile();

  // Get recent activities for department members
  const { data: recentActivities = [], isLoading } = useQuery({
    queryKey: ['department-recent-activities', profile?.department],
    queryFn: async () => {
      if (!profile?.department) return [];

      // Get team members first
      const { data: teamMembers, error: membersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('department', profile.department)
        .eq('is_active', true)
        .neq('id', profile.id);

      if (membersError) throw membersError;
      if (!teamMembers || teamMembers.length === 0) return [];

      const memberIds = teamMembers.map(m => m.id);
      const activities = [];

      // Get recent leave requests
      const { data: leaveRequests } = await supabase
        .from('leave_requests')
        .select('user_id, created_at, status')
        .in('user_id', memberIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (leaveRequests) {
        leaveRequests.forEach(request => {
          const member = teamMembers.find(m => m.id === request.user_id);
          if (member) {
            activities.push({
              employee: `${member.first_name} ${member.last_name}`,
              action: 'submitted leave request',
              time: getRelativeTime(request.created_at),
              type: 'leave'
            });
          }
        });
      }

      // Get recent attendance (late check-ins)
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const { data: attendance } = await supabase
        .from('attendance')
        .select('user_id, date, status, created_at')
        .in('user_id', memberIds)
        .gte('date', threeDaysAgo.toISOString().split('T')[0])
        .eq('status', 'late')
        .order('created_at', { ascending: false })
        .limit(3);

      if (attendance) {
        attendance.forEach(record => {
          const member = teamMembers.find(m => m.id === record.user_id);
          if (member) {
            activities.push({
              employee: `${member.first_name} ${member.last_name}`,
              action: 'checked in late',
              time: getRelativeTime(record.created_at),
              type: 'attendance'
            });
          }
        });
      }

      // Get recent goals/achievements
      const { data: goals } = await supabase
        .from('goals_okrs')
        .select('employee_id, title, status, updated_at')
        .in('employee_id', memberIds)
        .eq('status', 'Completed')
        .order('updated_at', { ascending: false })
        .limit(3);

      if (goals) {
        goals.forEach(goal => {
          const member = teamMembers.find(m => m.id === goal.employee_id);
          if (member) {
            activities.push({
              employee: `${member.first_name} ${member.last_name}`,
              action: `completed goal: ${goal.title}`,
              time: getRelativeTime(goal.updated_at),
              type: 'achievement'
            });
          }
        });
      }

      // Sort all activities by time and return top 4
      return activities
        .sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time))
        .slice(0, 4);
    },
    enabled: !!profile?.department
  });

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getTimeValue = (timeString: string) => {
    if (timeString.includes('hour')) {
      const hours = parseInt(timeString.match(/\d+/)?.[0] || '0');
      return hours;
    }
    if (timeString.includes('day')) {
      const days = parseInt(timeString.match(/\d+/)?.[0] || '0');
      return days * 24;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Department Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Department Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activities</h3>
            <p className="text-gray-600">No recent activities from your department members.</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesCard;
