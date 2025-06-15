
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

  // Get pending invitations count
  const { data: pendingInvitationsCount = 0 } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('status', 'PENDING')
        .eq('is_active', true);

      if (error) throw error;
      return data?.length || 0;
    }
  });

  const { data: salaryData = { totalEmployees: 0, monthlyPayroll: 0 } } = useQuery({
    queryKey: ['salary-data'],
    queryFn: async () => {
      console.log('Fetching salary data...');
      
      // Get all active employees
      const { data: activeEmployees, error: employeeError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      if (employeeError) {
        console.error('Error fetching employees:', employeeError);
        throw employeeError;
      }

      console.log('Active employees found:', activeEmployees?.length || 0);

      // Get salary structures for active employees - fix the relationship ambiguity
      const { data: salaryStructures, error: salaryError } = await supabase
        .from('salary_structures')
        .select(`
          ctc,
          employee_id,
          profiles!salary_structures_employee_id_fkey(is_active)
        `)
        .eq('is_active', true)
        .eq('profiles.is_active', true);

      if (salaryError) {
        console.error('Error fetching salary structures:', salaryError);
        throw salaryError;
      }

      console.log('Salary structures found:', salaryStructures?.length || 0);

      // Calculate total monthly payroll (CTC / 12)
      const monthlyPayroll = salaryStructures?.reduce((total, structure) => {
        return total + (Number(structure.ctc) / 12);
      }, 0) || 0;

      console.log('Total employees:', activeEmployees?.length || 0);
      console.log('Monthly payroll:', Math.round(monthlyPayroll));

      return {
        totalEmployees: activeEmployees?.length || 0,
        monthlyPayroll: Math.round(monthlyPayroll)
      };
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
      <HRMetrics 
        pendingInvitationsCount={pendingInvitationsCount} 
        totalEmployees={salaryData.totalEmployees}
        monthlyPayroll={salaryData.monthlyPayroll}
      />

      {/* Quick Actions & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HRQuickActions onInviteEmployee={() => setShowAddModal(true)} />
        <HRPendingTasks pendingInvitationsCount={pendingInvitationsCount} />
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
