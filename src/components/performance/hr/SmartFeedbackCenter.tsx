
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Brain, Zap, Target } from 'lucide-react';
import SmartFeedbackGenerator from '../SmartFeedbackGenerator';

const SmartFeedbackCenter = () => {
  return (
    <div className="space-y-6">
      {/* Header with AI Features Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Brain className="w-5 h-5" />
              <span>AI-Powered Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">
              Analyzes performance metrics, attendance, and historical data to generate comprehensive feedback
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Zap className="w-5 h-5" />
              <span>Instant Generation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Generate detailed performance reviews in seconds, saving hours of manual writing
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Target className="w-5 h-5" />
              <span>Personalized Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Tailored feedback based on role, department, and individual performance patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Smart Feedback Generator */}
      <SmartFeedbackGenerator />

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            <span>Tips for Best Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Data Quality</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure performance metrics are up to date</li>
                <li>• Include recent attendance records</li>
                <li>• Review existing feedback for context</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Review Period</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Select appropriate time frames (quarterly/annually)</li>
                <li>• Include significant project periods</li>
                <li>• Consider seasonal variations in performance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Feedback Style</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choose style based on review purpose</li>
                <li>• Use comprehensive for annual reviews</li>
                <li>• Select focused styles for specific discussions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Customization</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Edit generated content as needed</li>
                <li>• Add specific examples and achievements</li>
                <li>• Personalize tone for individual employees</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartFeedbackCenter;
