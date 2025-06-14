import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import LeaveStats from './LeaveStats';
import LeaveRequestCard from './LeaveRequestCard';
import LeaveCalendar from './LeaveCalendar';
import LeavePolicies from './LeavePolicies';
import ApplyLeaveModal from './ApplyLeaveModal';

const LeaveManagement = () => {
  const [selectedTab, setSelectedTab] = useState('requests');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Only HR and managers can manage requests, employees see only their own
  const canManageRequests = profile?.role === 'hr' || profile?.role === 'manager';

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          profiles!leave_requests_user_id_fkey(first_name, last_name, employee_id),
          approved_by_profile:profiles!leave_requests_approved_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Employees only see their own requests
      if (!canManageRequests) {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve leave request');
      console.error('Error approving leave request:', error);
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason || 'No reason provided'
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject leave request');
      console.error('Error rejecting leave request:', error);
    }
  });

  const getStats = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(req => req.status === 'pending').length;
    const approved = leaveRequests.filter(req => req.status === 'approved').length;
    const rejected = leaveRequests.filter(req => req.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            {canManageRequests 
              ? 'Manage employee leave requests and policies.' 
              : 'View your leave history and apply for new leaves.'}
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsApplyModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      <LeaveStats stats={stats} canManageRequests={canManageRequests} />

      <div className="flex space-x-1 mb-6">
        {[
          { id: 'requests', label: canManageRequests ? 'Leave Requests' : 'My Leave History' },
          { id: 'calendar', label: 'Leave Calendar' },
          { id: 'policies', label: 'Leave Policies' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {canManageRequests ? 'All Leave Requests' : 'My Leave History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {canManageRequests ? 'No leave requests found' : 'No leave requests found. Apply for your first leave!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    canManageRequests={canManageRequests}
                    currentUserProfile={profile}
                    onApprove={(requestId) => approveRequestMutation.mutate(requestId)}
                    onReject={(requestId) => rejectRequestMutation.mutate({ requestId })}
                    isApproving={approveRequestMutation.isPending}
                    isRejecting={rejectRequestMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'calendar' && <LeaveCalendar />}

      {selectedTab === 'policies' && <LeavePolicies />}

      <ApplyLeaveModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
      />
    </div>
  );
};

export default LeaveManagement;
