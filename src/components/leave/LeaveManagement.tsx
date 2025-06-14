
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const LeaveManagement = () => {
  const [selectedTab, setSelectedTab] = useState('requests');
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Only HR and managers can see all requests, employees see only their own
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

      // If not HR or manager, only show own requests
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

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
              : 'View and manage your leave requests.'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Requests', count: stats.total, color: 'bg-blue-50 text-blue-600' },
          { title: 'Pending', count: stats.pending, color: 'bg-yellow-50 text-yellow-600' },
          { title: 'Approved', count: stats.approved, color: 'bg-green-50 text-green-600' },
          { title: 'Rejected', count: stats.rejected, color: 'bg-red-50 text-red-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-1 mb-6">
        {[
          { id: 'requests', label: 'Leave Requests' },
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
              {canManageRequests ? 'All Leave Requests' : 'My Leave Requests'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No leave requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {request.profiles?.first_name?.[0]}{request.profiles?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {canManageRequests 
                              ? `${request.profiles?.first_name} ${request.profiles?.last_name}`
                              : 'My Leave Request'}
                          </h4>
                          <p className="text-sm text-gray-500">{request.leave_type}</p>
                          {canManageRequests && request.profiles?.employee_id && (
                            <p className="text-xs text-gray-400">ID: {request.profiles.employee_id}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{request.start_date}</p>
                          <p className="text-xs text-gray-500">Start Date</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{request.end_date}</p>
                          <p className="text-xs text-gray-500">End Date</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{request.days_requested} days</p>
                          <p className="text-xs text-gray-500">Duration</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {request.reason && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-sm text-red-600 mb-2">
                          <strong>Rejection Reason:</strong> {request.rejection_reason}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Applied on {new Date(request.created_at).toLocaleDateString()}
                          {request.approved_by_profile && (
                            <span className="ml-2">
                              • {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approved_by_profile.first_name} {request.approved_by_profile.last_name}
                            </span>
                          )}
                        </p>
                        {canManageRequests && request.status === 'pending' && (
                          <div className="space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveRequestMutation.mutate(request.id)}
                              disabled={approveRequestMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => rejectRequestMutation.mutate({ requestId: request.id })}
                              disabled={rejectRequestMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveManagement;
