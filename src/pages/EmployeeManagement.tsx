import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Building, UserPlus, Settings } from 'lucide-react';
import EmployeeList from '@/components/employees/EmployeeList';
import AddEmployee from '@/components/hr/AddEmployee';
import DepartmentManager from '@/components/employees/DepartmentManager';
import DocumentManager from '@/components/hr/DocumentManager';
import WorkflowManager from '@/components/employees/WorkflowManager';
import ResumeDataViewer from '@/components/hr/ResumeDataViewer';

const EmployeeManagement = () => {
  const { profile, loading } = useProfile();
  const [activeTab, setActiveTab] = useState('employees');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading employee management...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isHR = profile?.role === 'hr';
  const isManager = profile?.role === 'manager';

  if (!isHR && !isManager) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">You don't have permission to access employee management.</p>
        </div>
      </Layout>
    );
  }

  const handleAddEmployeeSuccess = () => {
    // Refresh employee list or show success message
    setActiveTab('employees');
  };

  const handleAddEmployeeClose = () => {
    // Close the add employee modal
    setActiveTab('employees');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600">
              {isHR ? "Manage employees, departments, and HR documents" : "View and manage your team"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isHR ? 'grid-cols-6' : 'grid-cols-2'}`}>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </TabsTrigger>
            {isHR && (
              <>
                <TabsTrigger value="add-employee" className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Add Employee</span>
                </TabsTrigger>
                <TabsTrigger value="departments" className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Departments</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Workflows</span>
                </TabsTrigger>
                <TabsTrigger value="resume-data" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Resume Data</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="employees">
            <EmployeeList />
          </TabsContent>

          {isHR && (
            <>
              <TabsContent value="add-employee">
                <AddEmployee 
                  onClose={handleAddEmployeeClose}
                  onSuccess={handleAddEmployeeSuccess}
                />
              </TabsContent>

              <TabsContent value="departments">
                <DepartmentManager />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentManager />
              </TabsContent>

              <TabsContent value="workflows">
                <WorkflowManager />
              </TabsContent>

              <TabsContent value="resume-data">
                <ResumeDataViewer />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default EmployeeManagement;
