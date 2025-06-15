
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
              <h4 className="font-medium text-blue-900">Mistral AI Model</h4>
              <p className="text-sm text-blue-700">
                Uses specialized employee attrition prediction model (robloxguard200/employee_attrition_rate_model_mistral) trained on HR datasets
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">Data Analysis</h4>
              <p className="text-sm text-blue-700">
                Analyzes performance metrics, attendance patterns, tenure, feedback ratings, salary data, and working hours
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">Risk Assessment</h4>
              <p className="text-sm text-blue-700">
                Provides LOW, MEDIUM, or HIGH risk categorization with AI-generated insights and confidence scores
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>AI-Only Predictions:</strong> Our system exclusively uses a specialized Mistral-based attrition prediction model 
            that analyzes employee profiles including department, designation, tenure, performance ratings, attendance rates, and working patterns. 
            The model generates probability scores and identifies key risk factors for each employee using advanced machine learning techniques.
          </p>
        </div>
        
        <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <strong>Service Requirement:</strong> This feature requires a valid Hugging Face API token. If the AI service is unavailable, 
            no predictions will be generated to ensure accuracy and reliability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttritionMethodologyCard;
