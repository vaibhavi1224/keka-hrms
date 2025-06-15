
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const AttritionMethodologyCard = () => {
  return (
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
  );
};

export default AttritionMethodologyCard;
