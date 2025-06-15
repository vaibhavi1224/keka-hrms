
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollExporterProps {
  onBack: () => void;
}

const PayrollExporter = ({ onBack }: PayrollExporterProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [includeDeductions, setIncludeDeductions] = useState(true);
  const [includeAllowances, setIncludeAllowances] = useState(true);
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const { toast } = useToast();

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['export-payroll-data', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          *,
          profiles!payrolls_employee_id_fkey(
            first_name,
            last_name,
            employee_code,
            department,
            designation
          )
        `)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const exportData = () => {
    if (!payrollData || payrollData.length === 0) {
      toast({
        title: "No Data",
        description: "No payroll data found for the selected period",
        variant: "destructive"
      });
      return;
    }

    // Build headers based on selected options
    const baseHeaders = ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Basic Salary'];
    const headers = [...baseHeaders];

    if (includeAllowances) {
      headers.push('HRA', 'Special Allowance', 'Transport Allowance', 'Medical Allowance', 'Other Allowances');
    }

    headers.push('Total Earnings');

    if (includeDeductions) {
      headers.push('PF Employee', 'Manual Deductions');
    }

    if (includeTaxes) {
      headers.push('TDS', 'ESI');
    }

    headers.push('Total Deductions', 'Net Pay', 'Status');

    // Build data rows
    const rows = payrollData.map(row => {
      const baseData = [
        row.profiles?.employee_code || '',
        `"${row.profiles?.first_name || ''} ${row.profiles?.last_name || ''}"`,
        row.profiles?.department || '',
        row.profiles?.designation || '',
        row.basic_salary
      ];

      const rowData = [...baseData];

      if (includeAllowances) {
        rowData.push(
          row.hra,
          row.special_allowance,
          row.transport_allowance,
          row.medical_allowance,
          row.other_allowances
        );
      }

      rowData.push(row.total_earnings);

      if (includeDeductions) {
        rowData.push(row.pf_employee || row.pf, row.manual_deductions);
      }

      if (includeTaxes) {
        rowData.push(row.tds, row.esi);
      }

      rowData.push(row.total_deductions, row.net_pay, row.status);

      return rowData;
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `payroll-export-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.${exportFormat}`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Payroll data exported successfully as ${exportFormat.toUpperCase()}`
    });
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold truncate">Export Payroll Data</h2>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Payroll Data Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-medium mb-2">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger className="w-full">
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

            <div className="min-w-0">
              <label className="block text-sm font-medium mb-2">Year</label>
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

            <div className="min-w-0">
              <label className="block text-sm font-medium mb-2">Format</label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'csv' | 'excel')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Options</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox 
                  id="allowances" 
                  checked={includeAllowances} 
                  onCheckedChange={(checked) => setIncludeAllowances(checked === true)} 
                />
                <label htmlFor="allowances" className="text-sm font-medium truncate">
                  Include Allowances
                </label>
              </div>

              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox 
                  id="deductions" 
                  checked={includeDeductions} 
                  onCheckedChange={(checked) => setIncludeDeductions(checked === true)} 
                />
                <label htmlFor="deductions" className="text-sm font-medium truncate">
                  Include Deductions
                </label>
              </div>

              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox 
                  id="taxes" 
                  checked={includeTaxes} 
                  onCheckedChange={(checked) => setIncludeTaxes(checked === true)} 
                />
                <label htmlFor="taxes" className="text-sm font-medium truncate">
                  Include Tax Details
                </label>
              </div>
            </div>
          </div>

          {payrollData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Preview</h4>
              <p className="text-sm text-gray-600 break-words">
                Found {payrollData.length} payroll records for {new Date(2024, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
              </p>
              <p className="text-sm text-gray-600 break-words">
                Total Payroll: ₹{new Intl.NumberFormat('en-IN').format(
                  payrollData.reduce((sum, row) => sum + Number(row.net_pay), 0)
                )}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={exportData} disabled={isLoading} className="min-w-0">
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{isLoading ? 'Loading...' : `Export as ${exportFormat.toUpperCase()}`}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollExporter;
