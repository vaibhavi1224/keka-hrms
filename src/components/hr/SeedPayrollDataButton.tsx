
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedPayrollData } from '@/utils/payrollDataSeeder';
import { useToast } from '@/hooks/use-toast';

interface SeedResult {
  success: number;
  errors: number;
}

const SeedPayrollDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedPayrollData();
      setSeedResult(result);
      
      if (result.errors === 0) {
        toast({
          title: "Success!",
          description: `Successfully generated 6 months of payroll data for ${result.success} employees.`,
        });
      } else {
        toast({
          title: "Partially completed",
          description: `Generated data for ${result.success} employees, ${result.errors} errors occurred.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding payroll data:', error);
      toast({
        title: "Error",
        description: "Failed to seed payroll data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSeedData}
        disabled={isSeeding}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isSeeding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Payroll Data...
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4 mr-2" />
            Generate 6 Months Payroll Data
          </>
        )}
      </Button>

      {seedResult && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {seedResult.errors === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">Payroll Data Results</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>✅ Successfully generated payroll data for: {seedResult.success} employees</p>
            {seedResult.errors > 0 && (
              <p>❌ Errors: {seedResult.errors}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-green-50 rounded">
        <p><strong>Note:</strong> This will generate 6 months of realistic payroll data including salary structures, monthly payslips, deductions, and earnings for all employees to populate reports and analytics.</p>
      </div>
    </div>
  );
};

export default SeedPayrollDataButton;
