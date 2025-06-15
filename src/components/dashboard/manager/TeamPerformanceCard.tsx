
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Users } from 'lucide-react';

const TeamPerformanceCard = () => {
  const { profile } = useProfile();

  // Get department team members with their latest performance
  const { data: teamPerformance = [], isLoading } = useQuery({
    queryKey: ['department-team-performance', profile?.department],
    queryFn: async () => {
      if (!profile?.department) return [];

      // First get team members
      const { data: teamMembers, error: membersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, designation')
        .eq('department', profile.department)
        .eq('is_active', true)
        .neq('id', profile.id)
        .limit(4); // Show top 4 performers

      if (membersError) throw membersError;
      if (!teamMembers || teamMembers.length === 0) return [];

      // Get their latest appraisals
      const memberIds = teamMembers.map(m => m.id);
      const { data: appraisals, error: appraisalsError } = await supabase
        .from('appraisals')
        .select('employee_id, final_rating')
        .in('employee_id', memberIds)
        .not('final_rating', 'is', null)
        .order('created_at', { ascending: false });

      if (appraisalsError) throw appraisalsError;

      // Combine data and calculate performance status
      return teamMembers.map(member => {
        const memberAppraisals = appraisals?.filter(a => a.employee_id === member.id) || [];
        const latestRating = memberAppraisals.length > 0 ? memberAppraisals[0].final_rating : 3.0;
        
        let status = 'average';
        if (latestRating >= 4.5) status = 'excellent';
        else if (latestRating >= 3.5) status = 'good';

        return {
          name: `${member.first_name} ${member.last_name}`,
          role: member.designation || 'Employee',
          performance: latestRating || 3.0,
          tasks: Math.floor(Math.random() * 5) + 5, // Placeholder for task count
          status
        };
      }).sort((a, b) => b.performance - a.performance); // Sort by performance desc
    },
    enabled: !!profile?.department
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
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
        <CardTitle>Department Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {teamPerformance.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
            <p className="text-gray-600">No performance data available for your department members.</p>
          </div>
        ) : (
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
                  <p className="font-medium text-gray-900">{member.performance.toFixed(1)}/5</p>
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
        )}
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceCard;
