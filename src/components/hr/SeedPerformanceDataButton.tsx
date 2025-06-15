
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedPerformanceData } from '@/utils/performanceDataSeeder';
import { SeedResult } from '@/types/performanceData';
import { useToast } from '@/hooks/use-toast';

const SeedPerformanceDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedPerformanceData();
      setSeedResult(result);
      
      if (result.errors === 0) {
        toast({
          title: "Success!",
          description: `Successfully generated performance data for ${result.success} employees.`,
        });
      } else {
        toast({
          title: "Partially completed",
          description: `Generated data for ${result.success} employees, ${result.errors} errors occurred.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding performance data:', error);
      toast({
        title: "Error",
        description: "Failed to seed performance data. Check console for details.",
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
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSeeding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Performance Data...
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Performance Data
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
            <span className="font-medium">Performance Data Results</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>✅ Successfully generated data for: {seedResult.success} employees</p>
            {seedResult.errors > 0 && (
              <p>❌ Errors: {seedResult.errors}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-purple-50 rounded">
        <p><strong>Note:</strong> This will generate 6 months of dummy performance metrics, feedback, and attendance data for all employees to enable meaningful AI insights generation.</p>
      </div>
    </div>
  );
};

export default SeedPerformanceDataButton;
