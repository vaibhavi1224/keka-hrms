
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Users } from 'lucide-react';

interface PredictionRecord {
  risk_level: string;
}

interface AttritionSummaryCardsProps {
  predictions: PredictionRecord[];
}

const AttritionSummaryCards = ({ predictions }: AttritionSummaryCardsProps) => {
  const highRiskEmployees = predictions.filter((p: PredictionRecord) => p.risk_level === 'HIGH').length;
  const mediumRiskEmployees = predictions.filter((p: PredictionRecord) => p.risk_level === 'MEDIUM').length;

  return (
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
  );
};

export default AttritionSummaryCards;
