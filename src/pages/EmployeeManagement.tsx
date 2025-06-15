
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeList from '@/components/employees/EmployeeList';
import DepartmentManager from '@/components/employees/DepartmentManager';
import DesignationManager from '@/components/employees/DesignationManager';
import OrgChart from '@/components/employees/OrgChart';
import { Users, Building, Briefcase, Network } from 'lucide-react';

const EmployeeManagement = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive employee management with onboarding, org structure, and workflows
          </p>
        </div>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="designations" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Designations
            </TabsTrigger>
            <TabsTrigger value="org-chart" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Org Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <EmployeeList />
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <DepartmentManager />
          </TabsContent>

          <TabsContent value="designations" className="space-y-6">
            <DesignationManager />
          </TabsContent>

          <TabsContent value="org-chart" className="space-y-6">
            <OrgChart />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EmployeeManagement;
