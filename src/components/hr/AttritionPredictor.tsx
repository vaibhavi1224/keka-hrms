import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, TrendingUp, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AttritionMethodologyCard from './attrition/AttritionMethodologyCard';
import AttritionSummaryCards from './attrition/AttritionSummaryCards';
import AttritionEmployeeSelection from './attrition/AttritionEmployeeSelection';
import AttritionResultsDisplay from './attrition/AttritionResultsDisplay';

interface PredictionRecord {
  employee_id: string;
  attrition_risk: number;
  risk_level: string;
  predicted_at: string;
  risk_factors?: string[] | string | null;
  profiles: {
    first_name: string;
    last_name: string;
    department: string;
  } | null;
}

const AttritionPredictor = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees-for-prediction'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, department, designation')
        .eq('is_active', true)
        .eq('role', 'employee')
        .order('first_name');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch existing predictions
  const { data: predictions = [], isLoading: loadingPredictions, refetch: refetchPredictions } = useQuery({
    queryKey: ['attrition-predictions'],
    queryFn: async () => {
      console.log('Fetching attrition predictions...');
      
      const { data: predictionData, error } = await supabase
        .from('attrition_predictions')
        .select('employee_id, attrition_risk, risk_level, predicted_at, risk_factors')
        .order('attrition_risk', { ascending: false });

      if (error) {
        console.error('Error fetching predictions:', error);
        return [];
      }

      if (!predictionData || predictionData.length === 0) {
        console.log('No prediction data found');
        return [];
      }

      console.log('Found prediction data:', predictionData.length, 'records');

      // Get employee names separately
      const employeeIds = predictionData.map(p => p.employee_id);
      const { data: employeeData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, department')
        .in('id', employeeIds);

      console.log('Found employee data:', employeeData?.length, 'records');

      // Combine data
      const combinedData = predictionData.map(prediction => ({
        ...prediction,
        profiles: employeeData?.find(emp => emp.id === prediction.employee_id) || null
      })) as PredictionRecord[];

      console.log('Combined data:', combinedData.length, 'records');
      return combinedData;
    }
  });

  // Clear all predictions mutation
  const clearPredictionsMutation = useMutation({
    mutationFn: async () => {
      console.log('Clearing all predictions...');
      
      const { error } = await supabase
        .from('attrition_predictions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Error clearing predictions:', error);
        throw error;
      }
      
      console.log('Successfully cleared all predictions');
    },
    onSuccess: () => {
      toast({
        title: "Analysis Cleared",
        description: "All previous attrition predictions have been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['attrition-predictions'] });
    },
    onError: (error) => {
      console.error('Clear predictions error:', error);
      toast({
        title: "Error",
        description: "Failed to clear existing predictions. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Run prediction mutation
  const runPredictionMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      console.log('Running AI prediction for employees:', employeeIds);
      
      // Clear old predictions first
      const { error: deleteError } = await supabase
        .from('attrition_predictions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('Error clearing old predictions:', deleteError);
        throw deleteError;
      }
      
      console.log('Cleared old predictions, now invoking AI edge function...');
      
      const { data, error } = await supabase.functions.invoke('attrition-predictor', {
        body: { employee_ids: employeeIds }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Edge function response:', data);
      return data;
    },
    onSuccess: (data) => {
      const count = data?.predictions?.length || 0;
      const failed = data?.failed_predictions?.length || 0;
      
      if (count > 0) {
        toast({
          title: "AI Analysis Complete! 🤖",
          description: `Generated ${count} AI predictions using Gemini AI${failed > 0 ? `, ${failed} failed` : ''}`,
        });
      } else {
        toast({
          title: "AI Analysis Failed",
          description: `No predictions generated. ${failed > 0 ? `${failed} attempts failed.` : 'Please check Gemini AI service configuration.'}`,
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['attrition-predictions'] });
    },
    onError: (error) => {
      console.error('Prediction error:', error);
      toast({
        title: "AI Prediction Failed",
        description: "The Gemini AI service is currently unavailable. Please ensure your Gemini API key is configured.",
        variant: "destructive",
      });
    }
  });

  const handleClearPredictions = () => {
    console.log('Clear predictions button clicked');
    clearPredictionsMutation.mutate();
  };

  const handleRefreshData = () => {
    console.log('Refresh data button clicked');
    refetchPredictions();
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest prediction results...",
    });
  };

  const handleRunPrediction = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee for prediction.",
        variant: "destructive",
      });
      return;
    }
    runPredictionMutation.mutate(selectedEmployees);
  };

  const handleRunForAllEmployees = () => {
    const allEmployeeIds = employees.map(emp => emp.id);
    console.log('Running AI prediction for all employees:', allEmployeeIds.length);
    runPredictionMutation.mutate(allEmployeeIds);
  };

  if (loadingEmployees) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
        <p className="text-gray-600">Add employees to your system to start using AI attrition prediction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Attrition Predictor
          </h2>
          <p className="text-gray-600 mt-1">Predict which employees are likely to leave using advanced Gemini AI analysis</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleClearPredictions}
            disabled={clearPredictionsMutation.isPending || predictions.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            {clearPredictionsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear Analysis
          </Button>
          <Button 
            onClick={handleRunForAllEmployees}
            disabled={runPredictionMutation.isPending || loadingEmployees}
            className="flex items-center gap-2"
          >
            {runPredictionMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            AI Analyze All ({employees.length})
          </Button>
        </div>
      </div>

      {/* Prediction Methodology Info */}
      <AttritionMethodologyCard />

      {/* Summary Cards */}
      <AttritionSummaryCards predictions={predictions} />

      {/* Employee Selection */}
      <AttritionEmployeeSelection
        employees={employees}
        selectedEmployees={selectedEmployees}
        onSelectionChange={setSelectedEmployees}
        onRunPrediction={handleRunPrediction}
        isRunning={runPredictionMutation.isPending}
      />

      {/* Predictions Results */}
      <AttritionResultsDisplay
        predictions={predictions}
        isLoading={loadingPredictions}
        isRunning={runPredictionMutation.isPending}
        onRefresh={handleRefreshData}
      />
    </div>
  );
};

export default AttritionPredictor;
