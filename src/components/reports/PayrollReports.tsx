
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollReportsProps {
  userRole: string;
}

const PayrollReports = ({ userRole }: PayrollReportsProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll-reports', selectedMonth, selectedYear, userRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_payroll_summary')
        .select('*')
        .eq('salary_month', selectedMonth);

      if (error) throw error;
      return data || [];
    }
  });

  const exportPayrollReport = (format: 'csv' | 'excel') => {
    if (!payrollData || payrollData.length === 0) {
      toast({
        title: "No Data",
        description: "No payroll data found for the selected period",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Employee Name', 'Employee ID', 'Month', 'Gross Salary', 'Deductions', 'Net Salary'];
    const csvContent = [
      headers.join(','),
      ...payrollData.map(row => [
        `"${row.full_name}"`,
        row.employee_id,
        row.salary_month,
        row.gross_salary,
        row.deductions,
        row.net_salary
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-report-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Payroll report exported as ${format.toUpperCase()}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payroll Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger>
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

            <div className="flex gap-2 mt-6">
              <Button onClick={() => exportPayrollReport('csv')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportPayrollReport('excel')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Data */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading payroll data...</p>
            </div>
          ) : payrollData && payrollData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Month</th>
                    <th className="px-4 py-2 text-right">Gross Salary</th>
                    <th className="px-4 py-2 text-right">Deductions</th>
                    <th className="px-4 py-2 text-right">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map((record, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{record.full_name}</td>
                      <td className="px-4 py-2">{record.salary_month}</td>
                      <td className="px-4 py-2 text-right">₹{new Intl.NumberFormat('en-IN').format(record.gross_salary)}</td>
                      <td className="px-4 py-2 text-right">₹{new Intl.NumberFormat('en-IN').format(record.deductions)}</td>
                      <td className="px-4 py-2 text-right font-semibold">₹{new Intl.NumberFormat('en-IN').format(record.net_salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No payroll data found for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollReports;
