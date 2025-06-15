
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaveReportsProps {
  userRole: string;
}

const LeaveReports = ({ userRole }: LeaveReportsProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const { data: leaveData, isLoading } = useQuery({
    queryKey: ['leave-reports', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-31`;
      
      const { data, error } = await supabase
        .from('view_leave_report')
        .select('*')
        .gte('from_date', startDate)
        .lte('to_date', endDate)
        .order('from_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const exportLeaveReport = (format: 'csv' | 'excel') => {
    if (!leaveData || leaveData.length === 0) {
      toast({
        title: "No Data",
        description: "No leave data found for the selected period",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Employee Name', 'Leave Type', 'Status', 'From Date', 'To Date', 'Reason'];
    const csvContent = [
      headers.join(','),
      ...leaveData.map(row => [
        `"${row.full_name}"`,
        row.leave_type,
        row.status,
        row.from_date,
        row.to_date,
        `"${row.reason || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-report-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Leave report exported as ${format.toUpperCase()}`
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Reports
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
              <Button onClick={() => exportLeaveReport('csv')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportLeaveReport('excel')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Data */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading leave data...</p>
            </div>
          ) : leaveData && leaveData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Leave Type</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">From Date</th>
                    <th className="px-4 py-2 text-left">To Date</th>
                    <th className="px-4 py-2 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveData.map((record, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{record.full_name}</td>
                      <td className="px-4 py-2">{record.leave_type}</td>
                      <td className="px-4 py-2">
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">{new Date(record.from_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{new Date(record.to_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 max-w-xs truncate">{record.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No leave data found for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveReports;
