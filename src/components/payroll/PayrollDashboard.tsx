
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, FileText, Settings, Calendar, Download } from 'lucide-react';
import SalaryStructureManager from './SalaryStructureManager';
import PayrollGenerator from './PayrollGenerator';
import PayrollReports from './PayrollReports';
import SalaryTemplates from './SalaryTemplates';

const PayrollDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Employees',
      value: '248',
      change: '+12 this month',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Monthly Payroll',
      value: '₹48,50,000',
      change: 'Current month',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Pending Payslips',
      value: '15',
      change: 'To be processed',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Processed',
      value: '233',
      change: 'This month',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Manage salary structures, generate payslips, and process payroll</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salary-structures">Salary Structures</TabsTrigger>
          <TabsTrigger value="payroll">Generate Payroll</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                      </div>
                      <div className={`${stat.bg} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('payroll')}
                >
                  <Calendar className="w-6 h-6" />
                  <span>Generate Payroll</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('salary-structures')}
                >
                  <Settings className="w-6 h-6" />
                  <span>Manage Salaries</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('reports')}
                >
                  <FileText className="w-6 h-6" />
                  <span>View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary-structures">
          <SalaryStructureManager />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollGenerator />
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
