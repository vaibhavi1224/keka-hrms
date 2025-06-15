
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Calendar, Clock } from 'lucide-react';

const UpcomingEventsCard = () => {
  const { profile } = useProfile();

  // Get upcoming events for the department
  const { data: upcomingEvents = [], isLoading } = useQuery({
    queryKey: ['department-upcoming-events', profile?.department],
    queryFn: async () => {
      if (!profile?.department) return [];

      const events = [];
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get team members
      const { data: teamMembers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('department', profile.department)
        .eq('is_active', true)
        .neq('id', profile.id);

      if (!teamMembers) return [];
      const memberIds = teamMembers.map(m => m.id);

      // Get upcoming leave requests that need approval
      const { data: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('user_id, start_date, leave_type')
        .in('user_id', memberIds)
        .eq('status', 'pending')
        .gte('start_date', today.toISOString().split('T')[0])
        .lte('start_date', nextWeek.toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(2);

      if (pendingLeaves) {
        pendingLeaves.forEach(leave => {
          const member = teamMembers.find(m => m.id === leave.user_id);
          if (member) {
            events.push({
              event: `Leave Approval - ${member.first_name} ${member.last_name}`,
              time: new Date(leave.start_date).toLocaleDateString(),
              type: 'review'
            });
          }
        });
      }

      // Get active review cycles ending soon
      const { data: reviewCycles } = await supabase
        .from('review_cycles')
        .select('name, end_date')
        .eq('status', 'Active')
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', nextWeek.toISOString().split('T')[0])
        .order('end_date', { ascending: true })
        .limit(2);

      if (reviewCycles) {
        reviewCycles.forEach(cycle => {
          events.push({
            event: `${cycle.name} Deadline`,
            time: new Date(cycle.end_date).toLocaleDateString(),
            type: 'deadline'
          });
        });
      }

      // Get goals ending soon
      const { data: upcomingGoals } = await supabase
        .from('goals_okrs')
        .select('title, end_date, employee_id')
        .in('employee_id', memberIds)
        .eq('status', 'In Progress')
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', nextWeek.toISOString().split('T')[0])
        .order('end_date', { ascending: true })
        .limit(1);

      if (upcomingGoals) {
        upcomingGoals.forEach(goal => {
          const member = teamMembers.find(m => m.id === goal.employee_id);
          if (member) {
            events.push({
              event: `Goal Deadline: ${goal.title}`,
              time: new Date(goal.end_date).toLocaleDateString(),
              type: 'deadline'
            });
          }
        });
      }

      // Add some default events if no real events
      if (events.length === 0) {
        events.push(
          { event: 'Team Standup', time: 'Daily 9:00 AM', type: 'meeting' },
          { event: 'Department Review', time: 'Next Friday', type: 'review' }
        );
      }

      return events.slice(0, 4); // Return max 4 events
    },
    enabled: !!profile?.department
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
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
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
            <p className="text-gray-600">No upcoming events for your department.</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;
