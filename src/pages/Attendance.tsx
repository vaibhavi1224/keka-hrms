
import React from 'react';
import Layout from '@/components/layout/Layout';
import AttendanceTracker from '@/components/attendance/AttendanceTracker';

const Attendance = () => {
  return (
    <Layout userRole="HR" userName="John Doe">
      <AttendanceTracker />
    </Layout>
  );
};

export default Attendance;
