import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, Users, DollarSign, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface PayrollAnalyticsProps {
  onBack: () => void;
}

const PayrollAnalytics = ({ onBack }: PayrollAnalyticsProps) => {
  const [selectedYear, setSelectedYear] = useState(2025);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['payroll-analytics', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          *,
          profiles!payrolls_employee_id_fkey(
            department,
            designation
          )
        `)
        .eq('year', selectedYear);

      if (error) throw error;
      return data;
    }
  });

  // Process data for charts
  const monthlyData = React.useMemo(() => {
    if (!analyticsData) return [];
    
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map(month => {
      const monthData = analyticsData.filter(record => record.month === month);
      const totalPayroll = monthData.reduce((sum, record) => sum + Number(record.net_pay), 0);
      const employeeCount = monthData.length;
      
      return {
        month: new Date(2024, month - 1).toLocaleString('default', { month: 'short' }),
        totalPayroll: Math.round(totalPayroll),
        employeeCount,
        averageSalary: employeeCount > 0 ? Math.round(totalPayroll / employeeCount) : 0
      };
    });
  }, [analyticsData]);

  const departmentData = React.useMemo(() => {
    if (!analyticsData) return [];
    
    const deptMap = new Map();
    analyticsData.forEach(record => {
      const dept = record.profiles?.department || 'Unknown';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { count: 0, totalPayroll: 0 });
      }
      const existing = deptMap.get(dept);
      deptMap.set(dept, {
        count: existing.count + 1,
        totalPayroll: existing.totalPayroll + Number(record.net_pay)
      });
    });

    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      count: data.count,
      totalPayroll: Math.round(data.totalPayroll),
      averageSalary: Math.round(data.totalPayroll / data.count)
    }));
  }, [analyticsData]);

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthData = analyticsData?.filter(record => record.month === currentMonth) || [];
  const totalEmployees = currentMonthData.length;
  const totalPayroll = currentMonthData.reduce((sum, record) => sum + Number(record.net_pay), 0);
  const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const chartConfig = {
    totalPayroll: {
      label: "Total Payroll",
      color: "#8884d8",
    },
    employeeCount: {
      label: "Employee Count",
      color: "#82ca9d",
    },
    averageSalary: {
      label: "Average Salary",
      color: "#ffc658",
    },
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold truncate">Payroll Analytics</h2>
        </div>
        
        <div className="w-48 min-w-0">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => (
                <SelectItem key={2020 + i} value={(2020 + i).toString()}>
                  {2020 + i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Total Employees</p>
                <p className="text-2xl font-bold truncate">{totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Total Payroll</p>
                <p className="text-2xl font-bold truncate">₹{new Intl.NumberFormat('en-IN').format(Math.round(totalPayroll))}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Average Salary</p>
                <p className="text-2xl font-bold truncate">₹{new Intl.NumberFormat('en-IN').format(Math.round(averageSalary))}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Departments</p>
                <p className="text-2xl font-bold truncate">{departmentData.length}</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="truncate">Monthly Payroll Trends - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <ChartContainer config={chartConfig} className="h-80 min-w-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="totalPayroll" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Total Payroll (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Wise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="truncate">Department Wise Employee Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ChartContainer config={chartConfig} className="h-64 min-w-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <XAxis dataKey="department" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#82ca9d" name="Employee Count" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="truncate">Department Wise Payroll Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ChartContainer config={chartConfig} className="h-64 min-w-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="totalPayroll"
                      nameKey="department"
                      label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollAnalytics;
