import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Brain, RefreshCw, TrendingUp, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttritionPrediction {
  employee_id: string;
  employee_name: string;
  attrition_risk: number;
  risk_level: string;
  factors: string[];
  last_predicted: string;
  error?: string;
}

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
  const { data: predictions = [], isLoading: loadingPredictions } = useQuery({
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

  // Run prediction mutation
  const runPredictionMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('attrition-predictor', {
        body: { employee_ids: employeeIds }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Predictions Generated",
        description: `Successfully generated attrition predictions for ${data.predictions.length} employees.`,
      });
      queryClient.invalidateQueries({ queryKey: ['attrition-predictions'] });
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRiskFactors = (riskFactors: string[] | string | null | undefined): string[] => {
    if (!riskFactors) return ['No specific risk factors identified'];
    
    if (Array.isArray(riskFactors)) {
      return riskFactors.length > 0 ? riskFactors : ['No specific risk factors identified'];
    }
    
    if (typeof riskFactors === 'string') {
      try {
        const parsed = JSON.parse(riskFactors);
        return Array.isArray(parsed) ? parsed : [riskFactors];
      } catch {
        return [riskFactors];
      }
    }
    
    return ['No specific risk factors identified'];
  };

  const highRiskEmployees = predictions.filter((p: PredictionRecord) => p.risk_level === 'HIGH').length;
  const mediumRiskEmployees = predictions.filter((p: PredictionRecord) => p.risk_level === 'MEDIUM').length;

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

      {/* Prediction Methodology Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Advanced AI Prediction Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mistral AI Model Factors:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Employee satisfaction levels (from feedback ratings)</li>
                <li>• Performance evaluation scores and trends</li>
                <li>• Working hours patterns and workload analysis</li>
                <li>• Tenure and department-specific insights</li>
                <li>• Salary competitiveness and promotion history</li>
                <li>• Advanced ML pattern recognition</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Risk Classifications:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="text-red-600 font-medium">High Risk</span>: &gt;70% probability of leaving</li>
                <li>• <span className="text-yellow-600 font-medium">Medium Risk</span>: 40-70% probability</li>
                <li>• <span className="text-green-600 font-medium">Low Risk</span>: &lt;40% probability</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Model: robloxguard200/employee_attrition_rate_model_mistral
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{highRiskEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumRiskEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
                <p className="text-2xl font-bold text-blue-600">{predictions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Employees for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {employees.map((employee) => (
                <label key={employee.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees([...selectedEmployees, employee.id]);
                      } else {
                        setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{employee.first_name} {employee.last_name}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedEmployees(employees.map(e => e.id))}
                variant="outline"
                size="sm"
              >
                Select All
              </Button>
              <Button
                onClick={() => setSelectedEmployees([])}
                variant="outline"
                size="sm"
              >
                Clear Selection
              </Button>
              <Button
                onClick={handleRunPrediction}
                disabled={selectedEmployees.length === 0 || runPredictionMutation.isPending}
                className="ml-auto"
              >
                Run Prediction ({selectedEmployees.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Results */}
      <Card>
        <CardHeader>
          <CardTitle>Attrition Risk Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPredictions ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading predictions...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No predictions available. Run analysis to see results.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction: PredictionRecord) => {
                const riskFactors = formatRiskFactors(prediction.risk_factors);
                
                return (
                  <div key={prediction.employee_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          {prediction.profiles?.first_name} {prediction.profiles?.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{prediction.profiles?.department}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getRiskColor(prediction.risk_level)}>
                          {prediction.risk_level} RISK
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {(prediction.attrition_risk * 100).toFixed(1)}% risk
                        </p>
                      </div>
                    </div>
                    
                    {/* Risk Factors */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Risk Factors:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {riskFactors.map((factor, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      Analyzed: {new Date(prediction.predicted_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttritionPredictor;
