import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedAllDummyData } from '@/utils/comprehensiveDataSeeder';
import { useToast } from '@/hooks/use-toast';
import { ComprehensiveSeedResult } from '@/types/seedingResults';

const SeedAllDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<ComprehensiveSeedResult | null>(null);
  const { toast } = useToast();

  const handleSeedAllData = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedAllDummyData();
      setSeedResult(result);
      
      const totalErrors = result.payroll.errors + result.performance.errors + result.bankDetails.errors;
      
      if (totalErrors === 0) {
        toast({
          title: "Success!",
          description: `Successfully generated 6 months of comprehensive data for ${result.totalEmployees} employees.`,
        });
      } else {
        toast({
          title: "Partially completed",
          description: `Generated data with ${totalErrors} errors. Check details below.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding comprehensive data:', error);
      toast({
        title: "Error",
        description: "Failed to seed comprehensive data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const totalErrors = seedResult ? 
    seedResult.payroll.errors + seedResult.performance.errors + seedResult.bankDetails.errors : 0;

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSeedAllData}
        disabled={isSeeding}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {isSeeding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating All Data...
          </>
        ) : (
          <>
            <Database className="w-4 h-4 mr-2" />
            Generate ALL 6 Months Data
          </>
        )}
      </Button>

      {seedResult && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            {totalErrors === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">Comprehensive Data Generation Results</span>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Total Employees: {seedResult.totalEmployees}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-blue-600">Bank Details</h4>
                <p>✅ Success: {seedResult.bankDetails.success}</p>
                {seedResult.bankDetails.errors > 0 && (
                  <p>❌ Errors: {seedResult.bankDetails.errors}</p>
                )}
              </div>
              
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-green-600">Performance Data</h4>
                <p>✅ Success: {seedResult.performance.success}</p>
                {seedResult.performance.errors > 0 && (
                  <p>❌ Errors: {seedResult.performance.errors}</p>
                )}
              </div>
              
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-purple-600">Payroll Data</h4>
                <p>✅ Success: {seedResult.payroll.success}</p>
                {seedResult.payroll.errors > 0 && (
                  <p>❌ Errors: {seedResult.payroll.errors}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-purple-50 rounded">
        <p><strong>Comprehensive Seeding:</strong> This will generate 6 months of realistic data including:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Bank details for all employees</li>
          <li>Daily attendance records</li>
          <li>Monthly performance metrics</li>
          <li>Quarterly performance reviews</li>
          <li>Monthly payroll with salary structures</li>
          <li>Performance insights and analytics data</li>
        </ul>
      </div>
    </div>
  );
};

export default SeedAllDataButton;
