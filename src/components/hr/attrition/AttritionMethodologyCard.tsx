
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Brain, BarChart3, Users } from 'lucide-react';

const AttritionMethodologyCard = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info className="w-5 h-5" />
          How Our AI Attrition Prediction Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">AI Analysis</h4>
              <p className="text-sm text-blue-700">
                Uses Hugging Face AI models to analyze employee patterns and predict attrition likelihood
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">Data Factors</h4>
              <p className="text-sm text-blue-700">
                Analyzes performance metrics, attendance patterns, tenure, and feedback ratings
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">Risk Assessment</h4>
              <p className="text-sm text-blue-700">
                Provides LOW, MEDIUM, or HIGH risk categorization with actionable insights
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Our hybrid approach combines AI predictions with rule-based analysis to ensure accurate results even when AI services are unavailable. 
            All predictions are generated in real-time using the latest employee data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttritionMethodologyCard;
