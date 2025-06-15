
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import SeedDataButton from './SeedDataButton';
import SeedPerformanceDataButton from './SeedPerformanceDataButton';
import SeedPayrollDataButton from './SeedPayrollDataButton';
import AddBankDetailsButton from './AddBankDetailsButton';

const HRDataManagement = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Data Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SeedDataButton />
          <SeedPerformanceDataButton />
          <SeedPayrollDataButton />
          <AddBankDetailsButton />
        </div>
      </CardContent>
    </Card>
  );
};

export default HRDataManagement;
