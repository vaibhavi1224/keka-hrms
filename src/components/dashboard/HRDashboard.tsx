
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InviteEmployee from '@/components/hr/InviteEmployee';
import { useInvitations } from '@/hooks/useInvitations';
import HRMetrics from './hr/HRMetrics';
import HRQuickActions from './hr/HRQuickActions';
import HRPendingTasks from './hr/HRPendingTasks';
import HRComplianceAlerts from './hr/HRComplianceAlerts';
import HRDepartmentOverview from './hr/HRDepartmentOverview';

const HRDashboard = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { invitations, refetch: refetchInvitations } = useInvitations();

  const pendingInvitations = invitations.filter(inv => inv.status === 'INVITED');

  const handleInviteSuccess = () => {
    refetchInvitations();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of HR operations and employee management</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Employee
        </Button>
      </div>

      {/* Key Metrics */}
      <HRMetrics pendingInvitationsCount={pendingInvitations.length} />

      {/* Quick Actions & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HRQuickActions onInviteEmployee={() => setShowInviteModal(true)} />
        <HRPendingTasks pendingInvitationsCount={pendingInvitations.length} />
      </div>

      {/* Compliance Alerts & Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HRComplianceAlerts />
        <HRDepartmentOverview />
      </div>

      {/* Invite Employee Modal */}
      {showInviteModal && (
        <InviteEmployee
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default HRDashboard;
