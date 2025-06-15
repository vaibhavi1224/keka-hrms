
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Download, Users, Clock, Calendar, TrendingUp } from 'lucide-react';
import PayrollReports from './PayrollReports';
import AttendanceReports from './AttendanceReports';
import LeaveReports from './LeaveReports';
import AnalyticsWidgets from './AnalyticsWidgets';
import CustomReportBuilder from './CustomReportBuilder';

interface ReportsAnalyticsDashboardProps {
  userRole: string;
}

const ReportsAnalyticsDashboard = ({ userRole }: ReportsAnalyticsDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const isHR = userRole === 'hr';
  const isManager = userRole === 'manager';
  const isEmployee = userRole === 'employee';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            {isHR && "Comprehensive organizational reporting and analytics"}
            {isManager && "Team performance reports and insights"}
            {isEmployee && "Personal reports and analytics"}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <AnalyticsWidgets userRole={userRole} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Payroll</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Leave</span>
          </TabsTrigger>
          {(isHR || isManager) && (
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Custom Reports</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Metrics Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Consolidated metrics across all modules</p>
                  <p className="text-sm">Attendance, Payroll, and Leave analytics</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Department Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Department-wise performance insights</p>
                  <p className="text-sm">Compare teams and departments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollReports userRole={userRole} />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceReports userRole={userRole} />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveReports userRole={userRole} />
        </TabsContent>

        {(isHR || isManager) && (
          <TabsContent value="custom">
            <CustomReportBuilder userRole={userRole} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ReportsAnalyticsDashboard;
