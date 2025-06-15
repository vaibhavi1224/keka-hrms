
import React from 'react';
import { Users, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

const TeamStatsCards = () => {
  const { profile } = useProfile();

  // Get department team members count
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['department-team-members', profile?.department],
    queryFn: async () => {
      if (!profile?.department) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('department', profile.department)
        .eq('is_active', true)
        .neq('id', profile.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.department
  });

  // Get today's attendance for department
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['department-attendance-today', profile?.department],
    queryFn: async () => {
      if (!profile?.department || teamMembers.length === 0) return [];

      const today = new Date().toISOString().split('T')[0];
      const teamMemberIds = teamMembers.map(m => m.id);

      const { data, error } = await supabase
        .from('attendance')
        .select('user_id, status')
        .in('user_id', teamMemberIds)
        .eq('date', today);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.department && teamMembers.length > 0
  });

  // Get pending leave requests for approval
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['department-pending-leaves', profile?.department],
    queryFn: async () => {
      if (!profile?.department || teamMembers.length === 0) return [];

      const teamMemberIds = teamMembers.map(m => m.id);

      const { data, error } = await supabase
        .from('leave_requests')
        .select('id, status')
        .in('user_id', teamMemberIds)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.department && teamMembers.length > 0
  });

  // Get average team performance rating
  const { data: teamPerformance } = useQuery({
    queryKey: ['department-performance', profile?.department],
    queryFn: async () => {
      if (!profile?.department || teamMembers.length === 0) return null;

      const teamMemberIds = teamMembers.map(m => m.id);

      const { data, error } = await supabase
        .from('appraisals')
        .select('final_rating')
        .in('employee_id', teamMemberIds)
        .not('final_rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(teamMemberIds.length);

      if (error) throw error;
      
      if (!data || data.length === 0) return { average: 0, change: 0 };
      
      const average = data.reduce((sum, a) => sum + (a.final_rating || 0), 0) / data.length;
      return { average: Math.round(average * 10) / 10, change: 0.3 };
    },
    enabled: !!profile?.department && teamMembers.length > 0
  });

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const attendancePercentage = teamMembers.length > 0 ? Math.round((presentCount / teamMembers.length) * 100) : 0;
  const urgentLeaves = pendingLeaves.filter((_, index) => index < 3).length;

  const teamStats = [
    { 
      label: 'Department Size', 
      value: teamMembers.length.toString(), 
      change: teamMembers.length > 0 ? '+1' : '0', 
      icon: Users, 
      color: 'blue' as const
    },
    { 
      label: 'Present Today', 
      value: presentCount.toString(), 
      change: `${attendancePercentage}%`, 
      icon: CheckCircle, 
      color: 'green' as const
    },
    { 
      label: 'Pending Approvals', 
      value: pendingLeaves.length.toString(), 
      change: urgentLeaves > 0 ? `${urgentLeaves} urgent` : 'none urgent', 
      icon: AlertTriangle, 
      color: 'orange' as const
    },
    { 
      label: 'Avg Performance', 
      value: teamPerformance ? `${teamPerformance.average}/5` : '0.0/5', 
      change: teamPerformance ? `+${teamPerformance.change}` : '+0.0', 
      icon: Star, 
      color: 'purple' as const
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {teamStats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TeamStatsCards;
