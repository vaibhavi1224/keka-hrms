
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddEmployee from '@/components/hr/AddEmployee';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import HRMetrics from './hr/HRMetrics';
import HRQuickActions from './hr/HRQuickActions';
import HRPendingTasks from './hr/HRPendingTasks';
import HRComplianceAlerts from './hr/HRComplianceAlerts';
import HRDepartmentOverview from './hr/HRDepartmentOverview';

const HRDashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: employees = [], refetch: refetchEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleAddSuccess = () => {
    refetchEmployees();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of HR operations and employee management</p>
        </div>
      </div>

      {/* Key Metrics */}
      <HRMetrics pendingInvitationsCount={0} />

      {/* Quick Actions & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HRQuickActions onInviteEmployee={() => setShowAddModal(true)} />
        <HRPendingTasks pendingInvitationsCount={0} />
      </div>

      {/* Compliance Alerts & Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HRComplianceAlerts />
        <HRDepartmentOverview />
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployee
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

export default HRDashboard;
