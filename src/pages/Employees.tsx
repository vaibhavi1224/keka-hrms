
import React from 'react';
import Layout from '@/components/layout/Layout';
import EmployeeList from '@/components/employees/EmployeeList';

const Employees = () => {
  return (
    <Layout userRole="HR" userName="John Doe">
      <EmployeeList />
    </Layout>
  );
};

export default Employees;
