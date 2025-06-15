
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

interface SalaryRevision {
  id: string;
  employee_id: string;
  old_ctc: number;
  new_ctc: number;
  old_basic_salary: number;
  new_basic_salary: number;
  revision_date: string;
  revision_reason: string;
  revision_notes: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  approved_by_profile: {
    first_name: string;
    last_name: string;
  };
}

const SalaryRevisionTracker = () => {
  // Fetch salary revision logs
  const { data: revisionLogs = [], isLoading } = useQuery({
    queryKey: ['salary-revision-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_revision_logs')
        .select(`
          id,
          employee_id,
          old_ctc,
          new_ctc,
          old_basic_salary,
          new_basic_salary,
          revision_date,
          revision_reason,
          revision_notes,
          created_at,
          profiles!employee_id (
            first_name,
            last_name,
            employee_id
          ),
          approved_by_profile:profiles!approved_by (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SalaryRevision[];
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChangePercentage = (oldValue: number, newValue: number) => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  const getChangeIcon = (oldValue: number, newValue: number) => {
    if (newValue > oldValue) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (newValue < oldValue) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading revision history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Salary Revision History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {revisionLogs?.map((revision) => {
            const ctcChange = getChangePercentage(revision.old_ctc, revision.new_ctc);
            const basicChange = getChangePercentage(revision.old_basic_salary, revision.new_basic_salary);
            
            return (
              <div key={revision.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {revision.profiles?.first_name} {revision.profiles?.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Employee ID: {revision.profiles?.employee_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Revision Date: {new Date(revision.revision_date).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Approved by: {revision.approved_by_profile?.first_name} {revision.approved_by_profile?.last_name}
                    </p>
                  </div>
                  <Badge variant={ctcChange > 0 ? "default" : "destructive"}>
                    {ctcChange > 0 ? '+' : ''}{ctcChange.toFixed(1)}% CTC Change
                  </Badge>
                </div>

                {/* CTC Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">CTC Changes</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Previous CTC:</span>
                      <span className="font-medium">{formatCurrency(revision.old_ctc)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New CTC:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatCurrency(revision.new_ctc)}</span>
                        {getChangeIcon(revision.old_ctc, revision.new_ctc)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Difference:</span>
                      <span className={`font-medium ${revision.new_ctc > revision.old_ctc ? 'text-green-600' : 'text-red-600'}`}>
                        {revision.new_ctc > revision.old_ctc ? '+' : ''}{formatCurrency(revision.new_ctc - revision.old_ctc)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Basic Salary Changes</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Previous Basic:</span>
                      <span className="font-medium">{formatCurrency(revision.old_basic_salary)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Basic:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatCurrency(revision.new_basic_salary)}</span>
                        {getChangeIcon(revision.old_basic_salary, revision.new_basic_salary)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Change:</span>
                      <Badge variant="outline">
                        {basicChange > 0 ? '+' : ''}{basicChange.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Revision Details */}
                {revision.revision_reason && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Reason: </span>
                    <span className="text-sm">{revision.revision_reason}</span>
                  </div>
                )}

                {revision.revision_notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes: </span>
                    <span className="text-sm text-gray-600">{revision.revision_notes}</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {!revisionLogs?.length && (
            <div className="text-center py-8 text-gray-500">
              No salary revisions found. Revisions will appear here when salary structures are updated.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryRevisionTracker;
