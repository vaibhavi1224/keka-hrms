
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  reason?: string;
  rejection_reason?: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    employee_id?: string;
  };
  approved_by_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  canManageRequests: boolean;
  currentUserProfile?: {
    first_name?: string;
    last_name?: string;
  };
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

const LeaveRequestCard = ({
  request,
  canManageRequests,
  currentUserProfile,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: LeaveRequestCardProps) => {
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

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {canManageRequests 
                ? `${request.profiles?.first_name?.[0]}${request.profiles?.last_name?.[0]}`
                : `${currentUserProfile?.first_name?.[0]}${currentUserProfile?.last_name?.[0]}`
              }
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
                onClick={() => onApprove(request.id)}
                disabled={isApproving}
              >
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onReject(request.id)}
                disabled={isRejecting}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestCard;
