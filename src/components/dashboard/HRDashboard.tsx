
import React from 'react';
import { Users, Clock, DollarSign, FileText, AlertCircle, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HRDashboard = () => {
  const quickActions = [
    { title: 'Add New Employee', color: 'bg-blue-600 hover:bg-blue-700', icon: Users },
    { title: 'Process Payroll', color: 'bg-green-600 hover:bg-green-700', icon: DollarSign },
    { title: 'Generate Reports', color: 'bg-purple-600 hover:bg-purple-700', icon: FileText },
    { title: 'Review Compliance', color: 'bg-orange-600 hover:bg-orange-700', icon: CheckCircle },
  ];

  const pendingTasks = [
    { task: 'Review 8 pending leave requests', priority: 'high', count: 8 },
    { task: 'Approve overtime for 12 employees', priority: 'medium', count: 12 },
    { task: 'Update 5 employee records', priority: 'low', count: 5 },
    { task: 'Process 3 resignation letters', priority: 'high', count: 3 },
  ];

  const complianceAlerts = [
    { type: 'Document Expiry', message: '15 work permits expiring this month', severity: 'warning' },
    { type: 'Training Due', message: '23 employees need safety training', severity: 'info' },
    { type: 'Policy Update', message: 'New labor law requires action', severity: 'urgent' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Management Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive overview of HR operations and employee management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">248</p>
                <p className="text-sm text-green-600 mt-1">+12 this month</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900">94.5%</p>
                <p className="text-sm text-green-600 mt-1">+2.1% vs last month</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-3xl font-bold text-gray-900">$485K</p>
                <p className="text-sm text-blue-600 mt-1">Due in 5 days</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Positions</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-orange-600 mt-1">3 urgent hires</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium text-center">{action.title}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{task.task}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {task.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts & Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>Compliance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceAlerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'urgent' ? 'bg-red-50 border-red-500' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alert.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { dept: 'Engineering', employees: 85, attendance: '96%', color: 'bg-blue-500' },
                { dept: 'Sales', employees: 42, attendance: '92%', color: 'bg-green-500' },
                { dept: 'Marketing', employees: 28, attendance: '94%', color: 'bg-purple-500' },
                { dept: 'Support', employees: 35, attendance: '98%', color: 'bg-orange-500' },
              ].map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${dept.color}`} />
                    <div>
                      <p className="font-medium text-gray-900">{dept.dept}</p>
                      <p className="text-sm text-gray-600">{dept.employees} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{dept.attendance}</p>
                    <p className="text-sm text-gray-600">attendance</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
