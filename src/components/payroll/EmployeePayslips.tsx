
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Calendar } from 'lucide-react';

const EmployeePayslips = () => {
  const { data: payslips, isLoading } = useQuery({
    queryKey: ['employee-payslips'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payrolls')
        .select('*')
        .eq('employee_id', user.id)
        .eq('status', 'finalized')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading payslips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
          <p className="text-gray-600 mt-1">View and download your salary statements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {payslips?.map((payslip) => (
          <Card key={payslip.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{getMonthName(payslip.month)} {payslip.year}</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Salary:</span>
                  <span className="font-medium">{formatCurrency(payslip.total_earnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payslip.total_deductions)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Pay:</span>
                    <span className="font-bold text-green-600">{formatCurrency(payslip.net_pay)}</span>
                  </div>
                </div>
                
                {payslip.lop_days > 0 && (
                  <div className="bg-yellow-50 p-2 rounded text-sm">
                    <span className="text-yellow-800">LOP Days: {payslip.lop_days}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!payslips?.length && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payslips Found</h3>
                <p className="text-gray-600">Your payslips will appear here once processed by HR.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePayslips;
