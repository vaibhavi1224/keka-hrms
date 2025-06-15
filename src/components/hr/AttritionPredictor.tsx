
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, TrendingUp, Trash2 } from 'lucide-react';
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

  // Fetch existing predictions with a simpler approach
  const { data: predictions = [], isLoading: loadingPredictions, refetch: refetchPredictions } = useQuery({
    queryKey: ['attrition-predictions'],
    queryFn: async () => {
      // Direct table query to avoid RPC issues
      const { data: predictionData, error } = await supabase
        .from('attrition_predictions')
        .select('employee_id, attrition_risk, risk_level, predicted_at, risk_factors')
        .order('attrition_risk', { ascending: false });

      if (error) {
        console.error('Error fetching predictions:', error);
        return [];
      }

      if (!predictionData || predictionData.length === 0) {
        return [];
      }

      // Get employee names separately
      const employeeIds = predictionData.map(p => p.employee_id);
      const { data: employeeData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, department')
        .in('id', employeeIds);

      // Combine data
      return predictionData.map(prediction => ({
        ...prediction,
        profiles: employeeData?.find(emp => emp.id === prediction.employee_id) || null
      })) as PredictionRecord[];
    }
  });

  // Clear all predictions mutation
  const clearPredictionsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('attrition_predictions')
        .delete()
        .gte('created_at', '1900-01-01'); // Delete all records by using a condition that matches all

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Analysis Cleared",
        description: "All previous attrition predictions have been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['attrition-predictions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear existing predictions. Please try again.",
        variant: "destructive",
      });
      console.error('Clear predictions error:', error);
    }
  });

  // Clear old predictions function
  const clearOldPredictions = async () => {
    const { error } = await supabase
      .from('attrition_predictions')
      .delete()
      .gte('created_at', '1900-01-01'); // Delete all records

    if (error) {
      console.error('Error clearing old predictions:', error);
      throw error;
    }
  };

  // Run prediction mutation
  const runPredictionMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      // Clear old predictions first
      await clearOldPredictions();
      
      const { data, error } = await supabase.functions.invoke('attrition-predictor', {
        body: { employee_ids: employeeIds }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Successfully generated fresh attrition predictions for ${data.predictions.length} employees.`,
      });
      // Force refresh the predictions data
      queryClient.invalidateQueries({ queryKey: ['attrition-predictions'] });
      queryClient.refetchQueries({ queryKey: ['attrition-predictions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate attrition predictions. Please try again.",
        variant: "destructive",
      });
      console.error('Prediction error:', error);
    }
  });

  const handleClearPredictions = () => {
    clearPredictionsMutation.mutate();
  };

  const handleRefreshData = () => {
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
    runPredictionMutation.mutate(allEmployeeIds);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Attrition Predictor
          </h2>
          <p className="text-gray-600 mt-1">Predict which employees are likely to leave using advanced Mistral AI analysis</p>
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
            disabled={runPredictionMutation.isPending}
            className="flex items-center gap-2"
          >
            {runPredictionMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Analyze All Employees
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
