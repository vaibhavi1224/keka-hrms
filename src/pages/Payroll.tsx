
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';
import EmployeePayslips from '@/components/payroll/EmployeePayslips';

const Payroll = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payroll...</p>
        </div>
      </div>
    );
  }

  // HR sees full payroll management, employees see their payslips
  if (profile?.role === 'hr') {
    return <PayrollDashboard />;
  } else {
    return <EmployeePayslips />;
  }
};

export default Payroll;
