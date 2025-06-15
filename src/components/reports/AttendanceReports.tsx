
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceReportsProps {
  userRole: string;
}

const AttendanceReports = ({ userRole }: AttendanceReportsProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance-reports', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-31`;
      
      const { data, error } = await supabase
        .from('view_attendance_summary')
        .select('*')
        .gte('day', startDate)
        .lte('day', endDate)
        .order('day', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const exportAttendanceReport = (format: 'csv' | 'excel') => {
    if (!attendanceData || attendanceData.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance data found for the selected period",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Employee Name', 'Date', 'Status', 'Check In', 'Check Out'];
    const csvContent = [
      headers.join(','),
      ...attendanceData.map(row => [
        `"${row.full_name}"`,
        row.day,
        row.status,
        row.check_in_time || '',
        row.check_out_time || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Attendance report exported as ${format.toUpperCase()}`
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      case 'on leave': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Reports
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
              <Button onClick={() => exportAttendanceReport('csv')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportAttendanceReport('excel')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Data */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance data...</p>
            </div>
          ) : attendanceData && attendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Check In</th>
                    <th className="px-4 py-2 text-left">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{record.full_name}</td>
                      <td className="px-4 py-2">{new Date(record.day).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No attendance data found for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;
