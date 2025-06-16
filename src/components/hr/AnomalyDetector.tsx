import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Clock, DollarSign, Brain, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Anomaly {
  type: string;
  subtype: string;
  employee_id: string;
  employee_name: string;
  value: number;
  z_score?: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  record_date: string;
  detected_at: string;
}

interface AnomalyResult {
  anomalies: Anomaly[];
  insights: {
    summary: string;
    generated_at: string;
  };
}

const AnomalyDetector = () => {
  const [detectionType, setDetectionType] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(90);
  const [detectionResult, setDetectionResult] = useState<AnomalyResult | null>(null);

  // Fetch employees for selection
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-anomaly'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('is_active', true)
        .order('first_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const detectAnomaliesMutation = useMutation({
    mutationFn: async () => {
      console.log('🔍 Starting anomaly detection...');
      
      const { data, error } = await supabase.functions.invoke('anomaly-detector', {
        body: {
          detectionType,
          employeeId: selectedEmployee === 'all' ? null : selectedEmployee,
          timeRange
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setDetectionResult(data);
      toast.success(`Detected ${data.anomalies.length} anomalies`);
    },
    onError: (error: any) => {
      toast.error(`Detection failed: ${error.message}`);
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payroll': return <DollarSign className="h-4 w-4" />;
      case 'attendance': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const groupedAnomalies = detectionResult?.anomalies.reduce((groups, anomaly) => {
    const key = anomaly.severity;
    if (!groups[key]) groups[key] = [];
    groups[key].push(anomaly);
    return groups;
  }, {} as Record<string, Anomaly[]>) || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Detection Type</label>
              <Select value={detectionType} onValueChange={setDetectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="payroll">Payroll Only</SelectItem>
                  <SelectItem value="attendance">Attendance Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Employee (Optional)</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => detectAnomaliesMutation.mutate()}
                disabled={detectAnomaliesMutation.isPending}
                className="w-full"
              >
                {detectAnomaliesMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Detect Anomalies
                  </>
                )}
              </Button>
            </div>
          </div>

          {detectionResult && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">High Severity</p>
                        <p className="text-2xl font-bold text-red-700">
                          {groupedAnomalies.high?.length || 0}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">Medium Severity</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {groupedAnomalies.medium?.length || 0}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Low Severity</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {groupedAnomalies.low?.length || 0}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              {detectionResult.insights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                        {detectionResult.insights.summary}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Anomalies List */}
              <Card>
                <CardHeader>
                  <CardTitle>Detected Anomalies ({detectionResult.anomalies.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {detectionResult.anomalies.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No anomalies detected in the selected time range.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {detectionResult.anomalies.map((anomaly, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(anomaly.type)}
                              <span className="font-medium">{anomaly.employee_name}</span>
                              <Badge variant={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(anomaly.record_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Type: {anomaly.type}</span>
                            <span>Subtype: {anomaly.subtype}</span>
                            <span>Value: {anomaly.value}</span>
                            {anomaly.z_score && (
                              <span>Z-Score: {anomaly.z_score.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetector;
