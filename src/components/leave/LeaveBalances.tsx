
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProfile } from '@/hooks/useProfile';

interface LeaveBalance {
  id: string;
  total_allocated: number;
  used_leaves: number;
  available_balance: number;
  leave_types: {
    name: string;
    description: string | null;
    max_leaves_per_year: number;
  };
}

const LeaveBalances = () => {
  const { profile } = useProfile();

  const { data: leaveBalances = [], isLoading } = useQuery({
    queryKey: ['leave-balances', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('leave_balances')
        .select(`
          *,
          leave_types!inner(name, description, max_leaves_per_year)
        `)
        .eq('employee_id', profile.id)
        .eq('accrual_year', new Date().getFullYear());

      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!profile?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading leave balances...</div>
        </CardContent>
      </Card>
    );
  }

  if (leaveBalances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">No leave balances found for this year.</p>
            <p className="text-sm text-gray-400 mt-1">
              Leave balances will be created automatically as leaves accrue.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave Balances ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {leaveBalances.map((balance) => {
            const usagePercentage = (balance.used_leaves / balance.total_allocated) * 100;
            const remainingPercentage = 100 - usagePercentage;

            return (
              <div key={balance.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{balance.leave_types.name}</h3>
                    {balance.leave_types.description && (
                      <p className="text-sm text-gray-600">{balance.leave_types.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {balance.available_balance} / {balance.total_allocated}
                    </div>
                    <div className="text-sm text-gray-600">days remaining</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {balance.used_leaves} days</span>
                    <span>Available: {balance.available_balance} days</span>
                  </div>
                  <Progress value={remainingPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{balance.available_balance}</div>
                    <div className="text-gray-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{balance.used_leaves}</div>
                    <div className="text-gray-600">Used</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{balance.total_allocated}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveBalances;
