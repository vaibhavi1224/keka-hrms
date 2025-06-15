
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PayrollCalculator from './PayrollCalculator';
import PayslipGenerator from './PayslipGenerator';
import ComplianceTracker from './ComplianceTracker';
import SalaryRevisionTracker from './SalaryRevisionTracker';
import SalaryStructureManager from './SalaryStructureManager';
import PayrollReports from './PayrollReports';
import SalaryTemplates from './SalaryTemplates';

const PayrollDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive payroll processing and management system</p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <PayrollCalculator />
        </TabsContent>

        <TabsContent value="payslips">
          <PayslipGenerator />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceTracker />
        </TabsContent>

        <TabsContent value="revisions">
          <SalaryRevisionTracker />
        </TabsContent>

        <TabsContent value="structures">
          <SalaryStructureManager />
        </TabsContent>

        <TabsContent value="templates">
          <SalaryTemplates />
        </TabsContent>

        <TabsContent value="reports">
          <PayrollReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollDashboard;
