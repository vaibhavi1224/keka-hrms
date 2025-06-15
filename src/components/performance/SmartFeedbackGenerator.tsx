
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Save, User, Calendar } from 'lucide-react';
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
  const [feedbackType, setFeedbackType] = useState('comprehensive');
  const [generatedFeedback, setGeneratedFeedback] = useState<GeneratedFeedback | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get all employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-feedback'],
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

  const generateFeedback = async () => {
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
          feedbackType
        }
      });

      if (error) throw error;

      setGeneratedFeedback(data.feedback);
      toast.success('Smart feedback generated successfully!');
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast.error('Failed to generate feedback. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveFeedback = async () => {
    if (!generatedFeedback || !selectedEmployee) return;

    setIsSaving(true);
    try {
      // Additional save to performance_feedback table with user confirmation
      const { error } = await supabase
        .from('performance_feedback')
        .insert({
          employee_id: selectedEmployee,
          feedback_type: 'manager_review',
          feedback_text: generatedFeedback.content,
          rating: generatedFeedback.suggestedRating,
          review_period_start: reviewPeriodStart,
          review_period_end: reviewPeriodEnd
        });

      if (error) throw error;

      toast.success('Feedback saved successfully!');
      
      // Reset form
      setSelectedEmployee('');
      setReviewPeriodStart('');
      setReviewPeriodEnd('');
      setGeneratedFeedback(null);
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedFeedback) {
      navigator.clipboard.writeText(generatedFeedback.content);
      toast.success('Feedback copied to clipboard!');
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Smart Feedback Generator</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate AI-powered performance review comments based on employee data and metrics
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{employee.first_name} {employee.last_name}</span>
                        <span className="text-xs text-gray-500">({employee.department})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Style</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
                  <SelectItem value="strengths_focused">Strengths Focused</SelectItem>
                  <SelectItem value="development_focused">Development Focused</SelectItem>
                  <SelectItem value="concise">Concise Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Review Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Review Period Start</Label>
              <Input
                id="start-date"
                type="date"
                value={reviewPeriodStart}
                onChange={(e) => setReviewPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Review Period End</Label>
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
              <h4 className="font-medium text-blue-900 mb-2">Selected Employee</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedEmployeeData.first_name} {selectedEmployeeData.last_name}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {selectedEmployeeData.department || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Designation:</span> {selectedEmployeeData.designation || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Review Period:</span> {reviewPeriodStart && reviewPeriodEnd ? `${reviewPeriodStart} to ${reviewPeriodEnd}` : 'Not set'}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateFeedback}
            disabled={!selectedEmployee || !reviewPeriodStart || !reviewPeriodEnd || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Feedback...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Smart Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Feedback Display */}
      {generatedFeedback && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Generated Feedback</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {generatedFeedback.source.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary">
                  Rating: {generatedFeedback.suggestedRating}/5
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Generated Feedback Content</Label>
              <Textarea
                value={generatedFeedback.content}
                onChange={(e) => setGeneratedFeedback({
                  ...generatedFeedback,
                  content: e.target.value
                })}
                rows={12}
                className="resize-none"
                placeholder="Generated feedback will appear here..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              
              <Button 
                onClick={saveFeedback}
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
                    Save Feedback
                  </>
                )}
              </Button>
              
              <div className="text-xs text-gray-500">
                Confidence: {Math.round(generatedFeedback.confidence * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartFeedbackGenerator;
