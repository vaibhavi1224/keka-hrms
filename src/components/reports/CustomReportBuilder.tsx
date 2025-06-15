
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomReportBuilderProps {
  userRole: string;
}

const CustomReportBuilder = ({ userRole }: CustomReportBuilderProps) => {
  const [reportType, setReportType] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('current_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    { value: 'payroll', label: 'Payroll Data' },
    { value: 'attendance', label: 'Attendance Records' },
    { value: 'leave', label: 'Leave Requests' },
    { value: 'combined', label: 'Combined Report' }
  ];

  const fieldOptions = {
    payroll: [
      'employee_name',
      'employee_id',
      'basic_salary',
      'total_earnings',
      'total_deductions',
      'net_pay',
      'month',
      'year'
    ],
    attendance: [
      'employee_name',
      'date',
      'status',
      'check_in_time',
      'check_out_time',
      'working_hours'
    ],
    leave: [
      'employee_name',
      'leave_type',
      'status',
      'from_date',
      'to_date',
      'days_requested',
      'reason'
    ],
    combined: [
      'employee_name',
      'department',
      'attendance_status',
      'leave_balance',
      'net_pay',
      'performance_rating'
    ]
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const getDateRangeValues = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    switch (dateRange) {
      case 'current_month':
        return {
          start: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
      case 'last_month':
        return {
          start: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        };
      case 'last_3_months':
        return {
          start: new Date(currentYear, currentMonth - 3, 1).toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'custom':
        return { start: startDate, end: endDate };
      default:
        return { start: startDate, end: endDate };
    }
  };

  const generateReport = async () => {
    if (!reportType || selectedFields.length === 0) {
      toast.error("Please select a report type and at least one field");
      return;
    }

    const dateValues = getDateRangeValues();
    if (!dateValues.start || !dateValues.end) {
      toast.error("Please provide valid date range");
      return;
    }

    setIsGenerating(true);
    try {
      let query;
      let data;

      switch (reportType) {
        case 'payroll':
          query = supabase
            .from('view_payroll_summary')
            .select('*')
            .gte('salary_month', new Date(dateValues.start).getMonth() + 1)
            .lte('salary_month', new Date(dateValues.end).getMonth() + 1);
          break;

        case 'attendance':
          query = supabase
            .from('view_attendance_summary')
            .select('*')
            .gte('day', dateValues.start)
            .lte('day', dateValues.end);
          break;

        case 'leave':
          query = supabase
            .from('view_leave_report')
            .select('*')
            .gte('from_date', dateValues.start)
            .lte('to_date', dateValues.end);
          break;

        case 'combined':
          // For combined report, we'll fetch multiple data sources
          const [payrollData, attendanceData, leaveData] = await Promise.all([
            supabase.from('view_payroll_summary').select('*'),
            supabase.from('view_attendance_summary').select('*').gte('day', dateValues.start).lte('day', dateValues.end),
            supabase.from('view_leave_report').select('*').gte('from_date', dateValues.start).lte('to_date', dateValues.end)
          ]);

          data = {
            payroll: payrollData.data || [],
            attendance: attendanceData.data || [],
            leave: leaveData.data || []
          };
          break;

        default:
          throw new Error('Invalid report type');
      }

      if (reportType !== 'combined') {
        const result = await query;
        if (result.error) throw result.error;
        data = result.data;
      }

      setReportData(data);
      toast.success(`Custom ${reportType} report generated successfully!`);
    } catch (error) {
      console.error('Error generating custom report:', error);
      toast.error('Failed to generate custom report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;

    let csvContent = '';
    let fileName = `custom-${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'combined') {
      // Handle combined report
      csvContent = 'Report Type,Data\n';
      csvContent += '"Payroll Records",' + JSON.stringify(reportData.payroll).replace(/"/g, '""') + '\n';
      csvContent += '"Attendance Records",' + JSON.stringify(reportData.attendance).replace(/"/g, '""') + '\n';
      csvContent += '"Leave Records",' + JSON.stringify(reportData.leave).replace(/"/g, '""') + '\n';
    } else {
      // Handle single report type
      if (reportData.length > 0) {
        // Create CSV headers from selected fields
        const headers = selectedFields.filter(field => 
          Object.keys(reportData[0]).includes(field) || field.includes('employee_name')
        );
        csvContent = headers.join(',') + '\n';

        // Add data rows
        reportData.forEach((row: any) => {
          const values = headers.map(header => {
            let value = row[header] || row[header.replace('employee_name', 'full_name')] || '';
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="current_year">Current Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Field Selection */}
          {reportType && (
            <div>
              <Label className="block text-sm font-medium mb-2">Select Fields</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fieldOptions[reportType as keyof typeof fieldOptions]?.map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <Label htmlFor={field} className="text-sm font-medium capitalize">
                      {field.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={generateReport} 
              disabled={!reportType || selectedFields.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Report</CardTitle>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Report Type:</strong> {reportTypes.find(t => t.value === reportType)?.label}</p>
                <p><strong>Date Range:</strong> {dateRange.replace(/_/g, ' ')}</p>
                <p><strong>Selected Fields:</strong> {selectedFields.join(', ')}</p>
                <p><strong>Records Found:</strong> {Array.isArray(reportData) ? reportData.length : 'Multiple datasets'}</p>
              </div>
              
              {Array.isArray(reportData) && reportData.length > 0 && (
                <div className="max-h-96 overflow-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedFields.map(field => (
                          <th key={field} className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 capitalize">
                            {field.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.slice(0, 10).map((row: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {selectedFields.map(field => (
                            <td key={field} className="px-4 py-2 border-b text-sm text-gray-700">
                              {row[field] || row[field.replace('employee_name', 'full_name')] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 10 records out of {reportData.length}. Download CSV for complete data.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {reportType && selectedFields.length > 0 && !reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p><strong>Report Type:</strong> {reportTypes.find(t => t.value === reportType)?.label}</p>
              <p><strong>Date Range:</strong> {dateRange.replace(/_/g, ' ')}</p>
              <p><strong>Selected Fields:</strong> {selectedFields.join(', ')}</p>
              <p className="mt-2 text-xs text-gray-500">
                This report will include {selectedFields.length} fields for the selected time period.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomReportBuilder;
