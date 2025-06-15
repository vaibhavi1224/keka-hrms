
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedAttritionPredictionData } from '@/utils/attritionDataSeeder';
import { useToast } from '@/hooks/use-toast';

interface SeedResult {
  employees: number;
  salaryStructures: number;
  performanceMetrics: number;
  attendanceRecords: number;
  feedbackRecords: number;
  errors: number;
}

const SeedAttritionDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedAttritionPredictionData();
      setSeedResult(result);
      
      if (result.errors === 0) {
        toast({
          title: "Success!",
          description: `Successfully generated attrition prediction data for ${result.employees} employees.`,
        });
      } else {
        toast({
          title: "Partially completed",
          description: `Generated data for ${result.employees} employees with ${result.errors} errors.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding attrition data:', error);
      toast({
        title: "Error",
        description: "Failed to seed attrition prediction data. Check console for details.",
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
            Generating Attrition Data...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Generate Attrition Prediction Data
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
            <span className="font-medium">Attrition Data Generation Results</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>👥 Employees processed: {seedResult.employees}</p>
            <p>💰 Salary structures: {seedResult.salaryStructures}</p>
            <p>📊 Performance metrics: {seedResult.performanceMetrics}</p>
            <p>📅 Attendance records: {seedResult.attendanceRecords}</p>
            <p>💬 Feedback records: {seedResult.feedbackRecords}</p>
            {seedResult.errors > 0 && (
              <p className="text-red-600">❌ Errors: {seedResult.errors}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-purple-50 rounded">
        <p><strong>Attrition Prediction Data:</strong> This generates comprehensive dummy data based on factors that influence employee attrition including:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Salary structures and compensation data</li>
          <li>Performance metrics and evaluations</li>
          <li>Attendance patterns and working hours</li>
          <li>Employee feedback and satisfaction levels</li>
          <li>Career progression and tenure data</li>
        </ul>
      </div>
    </div>
  );
};

export default SeedAttritionDataButton;
