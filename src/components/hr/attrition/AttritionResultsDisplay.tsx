
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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

const AttritionResultsDisplay = ({ predictions, isLoading, isRunning, onRefresh }: AttritionResultsDisplayProps) => {
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'MEDIUM':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'LOW':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatRiskFactors = (factors: string[] | string | null) => {
    if (!factors) return [];
    if (typeof factors === 'string') {
      try {
        return JSON.parse(factors);
      } catch {
        return [factors];
      }
    }
    return factors;
  };

  if (isLoading || isRunning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            {isRunning ? 'Generating Predictions...' : 'Loading Results...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-blue-200 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {isRunning ? 'AI is analyzing employee data...' : 'Fetching prediction results...'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attrition Prediction Results</CardTitle>
          <Button 
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Available</h3>
            <p className="text-gray-600">
              Run an analysis on selected employees to see attrition predictions here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={`${prediction.employee_id}-${prediction.predicted_at}`}
                className={`p-4 rounded-lg border ${getRiskColor(prediction.risk_level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getRiskIcon(prediction.risk_level)}
                      <h4 className="font-semibold">
                        {prediction.profiles?.first_name} {prediction.profiles?.last_name}
                      </h4>
                      <span className="text-sm px-2 py-1 rounded-full bg-white bg-opacity-50">
                        {prediction.risk_level} RISK
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Department:</span> {prediction.profiles?.department || 'N/A'}</p>
                      <p><span className="font-medium">Risk Score:</span> {Math.round(prediction.attrition_risk * 100)}%</p>
                      <p><span className="font-medium">Analyzed:</span> {new Date(prediction.predicted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(prediction.attrition_risk * 100)}%
                    </div>
                    <div className="text-xs opacity-75">
                      Attrition Risk
                    </div>
                  </div>
                </div>
                
                {prediction.risk_factors && formatRiskFactors(prediction.risk_factors).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white border-opacity-50">
                    <p className="text-sm font-medium mb-2">Risk Factors:</p>
                    <ul className="text-sm space-y-1">
                      {formatRiskFactors(prediction.risk_factors).map((factor, index) => (
                        <li key={`factor-${prediction.employee_id}-${index}`} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttritionResultsDisplay;
