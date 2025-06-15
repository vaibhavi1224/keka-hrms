
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, BarChart } from 'lucide-react';
import MonthlyReportGenerator from './reports/MonthlyReportGenerator';
import PayrollExporter from './reports/PayrollExporter';
import PayrollAnalytics from './reports/PayrollAnalytics';

const PayrollReports = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'export' | 'analytics'>('overview');

  if (activeTab === 'monthly') {
    return <MonthlyReportGenerator onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'export') {
    return <PayrollExporter onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'analytics') {
    return <PayrollAnalytics onBack={() => setActiveTab('overview')} />;
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Payroll Reports & Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 border-2 min-w-0"
              onClick={() => setActiveTab('monthly')}
            >
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-lg truncate">Monthly Report</span>
              <span className="text-sm text-gray-500 text-center px-2">Generate monthly payroll reports</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 border-2 min-w-0"
              onClick={() => setActiveTab('export')}
            >
              <Download className="w-8 h-8 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-lg truncate">Export Payroll</span>
              <span className="text-sm text-gray-500 text-center px-2">Export payroll data to CSV/Excel</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 border-2 min-w-0"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <span className="font-semibold text-lg truncate">Analytics</span>
              <span className="text-sm text-gray-500 text-center px-2">View payroll analytics & insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollReports;
