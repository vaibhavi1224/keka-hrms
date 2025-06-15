
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import SeedDataButton from './SeedDataButton';
import SeedPerformanceDataButton from './SeedPerformanceDataButton';
import SeedPayrollDataButton from './SeedPayrollDataButton';
import AddBankDetailsButton from './AddBankDetailsButton';
import SeedAllDataButton from './SeedAllDataButton';
import SeedAttritionDataButton from './SeedAttritionDataButton';

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
        {/* Comprehensive Seeder - Featured */}
        <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">🚀 Quick Setup</h3>
          <SeedAllDataButton />
        </div>

        {/* AI-Specific Data Seeder */}
        <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🤖 AI Prediction Data</h3>
          <SeedAttritionDataButton />
        </div>

        {/* Individual Seeders */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Data Generators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SeedDataButton />
            <SeedPerformanceDataButton />
            <SeedPayrollDataButton />
            <AddBankDetailsButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRDataManagement;
