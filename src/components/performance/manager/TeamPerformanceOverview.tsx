import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Target, Star, TrendingUp } from 'lucide-react';

const TeamPerformanceOverview = () => {
  const { profile } = useProfile();

  // Get team members from the same department
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['department-team-members', profile?.department],
    queryFn: async () => {
      if (!profile?.department) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('department', profile.department)
        .eq('is_active', true)
        .neq('id', profile.id); // Exclude the manager themselves

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.department
  });

  // Get team goals stats
  const { data: teamGoalsStats } = useQuery({
    queryKey: ['team-goals-stats', profile?.department],
    queryFn: async () => {
      if (!profile?.department || teamMembers.length === 0) return null;

      const teamMemberIds = teamMembers.map(m => m.id);
      
      const { data, error } = await supabase
        .from('goals_okrs')
        .select('status, employee_id')
        .in('employee_id', teamMemberIds);

      if (error) throw error;
      
      const total = data?.length || 0;
      const completed = data?.filter(g => g.status === 'Completed').length || 0;
      const inProgress = data?.filter(g => g.status === 'In Progress').length || 0;
      
      return {
        total,
        completed,
        inProgress,
        notStarted: total - completed - inProgress,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    },
    enabled: !!profile?.department && teamMembers.length > 0
  });

  // Get recent appraisals for team
  const { data: recentAppraisals = [] } = useQuery({
    queryKey: ['department-appraisals', profile?.department],
    queryFn: async () => {
      if (!profile?.department || teamMembers.length === 0) return [];

      const teamMemberIds = teamMembers.map(m => m.id);
      
      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          *,
          employee:profiles!appraisals_employee_id_fkey(first_name, last_name),
          review_cycle:review_cycles(name)
        `)
        .in('employee_id', teamMemberIds)
        .order('decided_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.department && teamMembers.length > 0
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Department Size</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold">{teamGoalsStats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{teamGoalsStats?.completionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {recentAppraisals.length > 0 
                    ? (recentAppraisals.reduce((sum, a) => sum + (a.final_rating || 0), 0) / recentAppraisals.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress Overview */}
      {teamGoalsStats && (
        <Card>
          <CardHeader>
            <CardTitle>Department Goals Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{teamGoalsStats.completionRate}%</span>
              </div>
              <Progress value={teamGoalsStats.completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">{teamGoalsStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-600">{teamGoalsStats.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-600">{teamGoalsStats.notStarted}</p>
                <p className="text-sm text-gray-600">Not Started</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Members Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Department Members - {profile?.department}</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Department Members</h3>
              <p className="text-gray-600">No other employees found in your department.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-gray-600">{member.designation}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Appraisals */}
      {recentAppraisals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Department Appraisals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppraisals.map((appraisal) => (
                <div key={appraisal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {appraisal.employee?.first_name} {appraisal.employee?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{appraisal.review_cycle?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{appraisal.final_rating}/5</Badge>
                    {appraisal.promotion_eligible && (
                      <Badge className="bg-green-100 text-green-800">Promotion Eligible</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamPerformanceOverview;
