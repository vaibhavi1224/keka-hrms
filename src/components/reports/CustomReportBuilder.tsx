
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomReportBuilderProps {
  userRole: string;
}

const CustomReportBuilder = ({ userRole }: CustomReportBuilderProps) => {
  const [reportType, setReportType] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('current_month');
  const { toast } = useToast();

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

  const generateReport = () => {
    if (!reportType || selectedFields.length === 0) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a report type and at least one field",
        variant: "destructive"
      });
      return;
    }

    // This would typically call an API to generate the custom report
    toast({
      title: "Report Generated",
      description: `Custom ${reportType} report with ${selectedFields.length} fields is being generated`,
    });
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
            <label className="block text-sm font-medium mb-2">Report Type</label>
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
            <label className="block text-sm font-medium mb-2">Date Range</label>
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

          {/* Field Selection */}
          {reportType && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Fields</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fieldOptions[reportType as keyof typeof fieldOptions]?.map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <label htmlFor={field} className="text-sm font-medium capitalize">
                      {field.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end space-x-3">
            <Button onClick={generateReport} disabled={!reportType || selectedFields.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {reportType && selectedFields.length > 0 && (
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
