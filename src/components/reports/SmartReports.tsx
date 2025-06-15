
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Brain, TrendingUp, Users, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SmartReport {
  type: string;
  aiSummary: string;
  metrics: any;
  generatedAt: string;
}

const SmartReports = () => {
  const [reportType, setReportType] = useState('employee_performance');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState<SmartReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, department')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data || [];
    }
  });

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (reportType === 'employee_performance' && !selectedEmployee) {
      toast.error('Please select an employee for performance report');
      return;
    }

    if ((reportType === 'team_trends' || reportType === 'department_overview') && !selectedDepartment) {
      toast.error('Please select a department');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-reports', {
        body: {
          reportType,
          employeeId: selectedEmployee,
          departmentId: selectedDepartment,
          startDate,
          endDate
        }
      });

      if (error) throw error;

      setGeneratedReport(data.report);
      toast.success('Smart report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const reportContent = `
SMART REPORT - ${reportType.toUpperCase()}
Generated: ${new Date(generatedReport.generatedAt).toLocaleString()}

AI SUMMARY:
${generatedReport.aiSummary}

METRICS:
${JSON.stringify(generatedReport.metrics, null, 2)}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Smart Reports</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate AI-powered natural language summaries of employee performance and team trends
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee_performance">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Employee Performance Summary</span>
                  </div>
                </SelectItem>
                <SelectItem value="team_trends">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Team Trends Analysis</span>
                  </div>
                </SelectItem>
                <SelectItem value="department_overview">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Department Overview</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportType === 'employee_performance' && (
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(reportType === 'team_trends' || reportType === 'department_overview') && (
              <div className="space-y-2">
                <Label>Select Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateReport}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Smart Report...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Smart Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>AI-Generated Report Summary</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {reportType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Natural Language Summary</Label>
              <Textarea
                value={generatedReport.aiSummary}
                readOnly
                rows={8}
                className="resize-none bg-gray-50"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(generatedReport.metrics || {}).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Generated on: {new Date(generatedReport.generatedAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartReports;
