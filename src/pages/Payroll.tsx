
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';
import EmployeePayslips from '@/components/payroll/EmployeePayslips';
import Layout from '@/components/layout/Layout';

const Payroll = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payroll...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // HR sees full payroll management, employees see their payslips
  return (
    <Layout>
      {profile?.role === 'hr' ? <PayrollDashboard /> : <EmployeePayslips />}
    </Layout>
  );
};

export default Payroll;
