
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Copy, Save, User, Calendar, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedFeedback {
  content: string;
  suggestedRating: number;
  source: string;
  confidence: number;
}

const SmartFeedbackGenerator = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reviewPeriodStart, setReviewPeriodStart] = useState('');
  const [reviewPeriodEnd, setReviewPeriodEnd] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [generatedAnalysis, setGeneratedAnalysis] = useState<GeneratedFeedback | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get all employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, department, designation')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data || [];
    }
  });

  const generateAnalysis = async () => {
    if (!selectedEmployee || !reviewPeriodStart || !reviewPeriodEnd) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-feedback-generator', {
        body: {
          employeeId: selectedEmployee,
          reviewPeriodStart,
          reviewPeriodEnd,
          feedbackType: analysisType
        }
      });

      if (error) throw error;

      setGeneratedAnalysis(data.feedback);
      toast.success('Smart feedback generated successfully!');
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate feedback. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAnalysis = async () => {
    if (!generatedAnalysis || !selectedEmployee) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('performance_feedback')
        .insert({
          employee_id: selectedEmployee,
          feedback_type: 'hr_analysis',
          feedback_text: generatedAnalysis.content,
          rating: generatedAnalysis.suggestedRating,
          review_period_start: reviewPeriodStart,
          review_period_end: reviewPeriodEnd
        });

      if (error) throw error;

      toast.success('Smart feedback saved successfully!');
      
      // Reset form
      setSelectedEmployee('');
      setReviewPeriodStart('');
      setReviewPeriodEnd('');
      setGeneratedAnalysis(null);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('Failed to save feedback');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedAnalysis) {
      navigator.clipboard.writeText(generatedAnalysis.content);
      toast.success('Feedback copied to clipboard!');
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Smart Feedback Generator</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate AI-powered performance feedback and HR decision insights to help make informed decisions about employee promotions, salary adjustments, training, and retention strategies
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee for Analysis</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(emp => emp.id && emp.first_name && emp.last_name).map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{employee.first_name} {employee.last_name}</span>
                        <span className="text-xs text-gray-500">({employee.department || 'No Dept'})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="analysis-type">Feedback Focus</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive HR Review</SelectItem>
                  <SelectItem value="promotion_readiness">Promotion Readiness</SelectItem>
                  <SelectItem value="retention_risk">Retention Risk Assessment</SelectItem>
                  <SelectItem value="performance_improvement">Performance Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Review Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Analysis Period Start</Label>
              <Input
                id="start-date"
                type="date"
                value={reviewPeriodStart}
                onChange={(e) => setReviewPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Analysis Period End</Label>
              <Input
                id="end-date"
                type="date"
                value={reviewPeriodEnd}
                onChange={(e) => setReviewPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Selected Employee Info */}
          {selectedEmployeeData && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Employee Profile</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedEmployeeData.first_name} {selectedEmployeeData.last_name}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {selectedEmployeeData.department || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {selectedEmployeeData.designation || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Analysis Period:</span> {reviewPeriodStart && reviewPeriodEnd ? `${reviewPeriodStart} to ${reviewPeriodEnd}` : 'Not set'}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateAnalysis}
            disabled={!selectedEmployee || !reviewPeriodStart || !reviewPeriodEnd || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Employee Data...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Smart Feedback & HR Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Analysis Display */}
      {generatedAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>AI-Generated HR Insights</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {generatedAnalysis.source.replace('_', ' ')} AI
                </Badge>
                <Badge variant="secondary">
                  Score: {generatedAnalysis.suggestedRating}/5
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Smart Feedback & HR Decision Insights</Label>
              <Textarea
                value={generatedAnalysis.content}
                onChange={(e) => setGeneratedAnalysis({
                  ...generatedAnalysis,
                  content: e.target.value
                })}
                rows={16}
                className="resize-none font-mono text-sm"
                placeholder="AI-generated feedback and insights will appear here..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy Feedback
              </Button>
              
              <Button 
                onClick={saveAnalysis}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Records
                  </>
                )}
              </Button>
              
              <div className="text-xs text-gray-500">
                Confidence: {Math.round(generatedAnalysis.confidence * 100)}%
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This AI-generated feedback is designed to assist HR decision-making. 
                Please consider additional factors and conduct proper reviews before making final employment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartFeedbackGenerator;
