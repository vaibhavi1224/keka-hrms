
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonthlyReportGeneratorProps {
  onBack: () => void;
}

const MonthlyReportGenerator = ({ onBack }: MonthlyReportGeneratorProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['monthly-payroll-report', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          *,
          profiles!payrolls_employee_id_fkey(
            first_name,
            last_name,
            employee_code,
            department
          )
        `)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const generateReport = () => {
    refetch();
  };

  const downloadReport = () => {
    if (!reportData || reportData.length === 0) {
      toast({
        title: "No Data",
        description: "No payroll data found for the selected period",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = [
      'Employee Code', 'Employee Name', 'Department', 'Basic Salary', 'HRA', 
      'Special Allowance', 'Transport Allowance', 'Medical Allowance', 'Other Allowances',
      'Total Earnings', 'PF', 'TDS', 'Total Deductions', 'Net Pay', 'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.profiles?.employee_code || '',
        `"${row.profiles?.first_name || ''} ${row.profiles?.last_name || ''}"`,
        row.profiles?.department || '',
        row.basic_salary,
        row.hra,
        row.special_allowance,
        row.transport_allowance,
        row.medical_allowance,
        row.other_allowances,
        row.total_earnings,
        row.pf,
        row.tds,
        row.total_deductions,
        row.net_pay,
        row.status
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-report-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Monthly report downloaded successfully"
    });
  };

  const totalPayroll = reportData?.reduce((sum, row) => sum + Number(row.net_pay), 0) || 0;
  const totalEmployees = reportData?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Monthly Payroll Report</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Generate Monthly Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => (
                    <SelectItem key={2020 + i} value={(2020 + i).toString()}>
                      {2020 + i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {reportData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
                      <p className="text-sm text-gray-600">Total Employees</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{new Intl.NumberFormat('en-IN').format(totalPayroll)}
                      </p>
                      <p className="text-sm text-gray-600">Total Payroll</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{totalEmployees > 0 ? new Intl.NumberFormat('en-IN').format(Math.round(totalPayroll / totalEmployees)) : 0}
                      </p>
                      <p className="text-sm text-gray-600">Average Salary</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={downloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReportGenerator;
