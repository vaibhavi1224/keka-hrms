
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Calendar, DollarSign } from 'lucide-react';

interface AnalyticsWidgetsProps {
  userRole: string;
}

const AnalyticsWidgets = ({ userRole }: AnalyticsWidgetsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-stats', userRole],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // Get attendance stats
      const { data: attendanceData } = await supabase
        .from('view_attendance_summary')
        .select('*')
        .gte('day', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

      // Get payroll stats
      const { data: payrollData } = await supabase
        .from('view_payroll_summary')
        .select('*')
        .eq('salary_month', currentMonth);

      // Get leave stats
      const { data: leaveData } = await supabase
        .from('view_leave_report')
        .select('*')
        .gte('from_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

      // Get total employees
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      return {
        totalEmployees: profilesData?.length || 0,
        attendanceRecords: attendanceData?.length || 0,
        payrollProcessed: payrollData?.length || 0,
        leaveRequests: leaveData?.length || 0,
        totalPayroll: payrollData?.reduce((sum, record) => sum + Number(record.net_salary || 0), 0) || 0
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const widgets = [
    {
      title: userRole === 'employee' ? 'My Records' : 'Total Employees',
      value: userRole === 'employee' ? '1' : stats?.totalEmployees || 0,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Attendance Records',
      value: stats?.attendanceRecords || 0,
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Leave Requests',
      value: stats?.leaveRequests || 0,
      icon: Calendar,
      color: 'text-orange-600'
    },
    {
      title: userRole === 'employee' ? 'My Payroll' : 'Total Payroll',
      value: `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(stats?.totalPayroll || 0)}`,
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {widgets.map((widget, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{widget.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <widget.icon className={`w-5 h-5 ${widget.color}`} />
              <span className="text-2xl font-bold">{widget.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsWidgets;
