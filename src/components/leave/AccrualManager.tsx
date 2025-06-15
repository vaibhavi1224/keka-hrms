
import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

interface AccrualLog {
  id: string;
  accrued_amount: number;
  accrual_date: string;
  accrual_reason: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
  leave_types: {
    name: string;
  };
}

const AccrualManager = () => {
  const { profile } = useProfile();

  const { data: recentAccruals = [], refetch } = useQuery({
    queryKey: ['recent-accruals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_accrual_logs')
        .select(`
          *,
          profiles!leave_accrual_logs_employee_id_fkey(first_name, last_name),
          leave_types!leave_accrual_logs_leave_type_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AccrualLog[];
    },
    enabled: profile?.role === 'hr'
  });

  const runAccrualMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('process_monthly_leave_accrual');
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Monthly accrual process completed successfully');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to run accrual process');
      console.error('Error running accrual:', error);
    }
  });

  if (profile?.role !== 'hr') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Accrual Management
          </CardTitle>
          <Button 
            onClick={() => runAccrualMutation.mutate()}
            disabled={runAccrualMutation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Monthly Accrual
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Accrual Process</h3>
            <p className="text-sm text-blue-700">
              The monthly accrual process adds leave days to all employees based on their leave type accrual rates. 
              This should typically be run at the beginning of each month.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recent Accrual Activity</h3>
            {recentAccruals.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent accrual activity found
              </div>
            ) : (
              <div className="space-y-2">
                {recentAccruals.map((accrual) => (
                  <div key={accrual.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {accrual.profiles.first_name} {accrual.profiles.last_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {accrual.leave_types.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        +{accrual.accrued_amount} days
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(accrual.accrual_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccrualManager;
