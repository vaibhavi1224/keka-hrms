
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Brain, Info } from 'lucide-react';

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

interface AttritionResultsDisplayProps {
  predictions: PredictionRecord[];
  isLoading: boolean;
  isRunning: boolean;
  onRefresh: () => void;
}

const AttritionResultsDisplay = ({ 
  predictions, 
  isLoading, 
  isRunning, 
  onRefresh 
}: AttritionResultsDisplayProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Latest Attrition Risk Analysis Results</span>
          {predictions.length > 0 && (
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Data
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || isRunning ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">
              {isRunning ? 'Generating fresh predictions...' : 'Loading predictions...'}
            </p>
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
  );
};

export default AttritionResultsDisplay;
