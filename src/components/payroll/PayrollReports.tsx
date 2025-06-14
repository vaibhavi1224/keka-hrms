
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, BarChart } from 'lucide-react';

const PayrollReports = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="w-5 h-5" />
            <span>Payroll Reports & Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <FileText className="w-6 h-6" />
              <span>Monthly Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Download className="w-6 h-6" />
              <span>Export Payroll</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BarChart className="w-6 h-6" />
              <span>Analytics</span>
            </Button>
          </div>
          
          <div className="mt-8 text-center py-8 text-gray-500">
            Advanced reporting and analytics features coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollReports;
