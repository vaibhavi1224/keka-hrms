
import React from 'react';
import Layout from '@/components/layout/Layout';
import LeaveManagement from '@/components/leave/LeaveManagement';

const Leave = () => {
  return (
    <Layout userRole="HR" userName="John Doe">
      <LeaveManagement />
    </Layout>
  );
};

export default Leave;
