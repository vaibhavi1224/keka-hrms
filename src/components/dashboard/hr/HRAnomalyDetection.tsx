
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HRAnomalyDetection = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Anomaly Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            AI-powered detection of unusual patterns in payroll and attendance data.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Payroll Anomalies</p>
                <p className="text-xs text-gray-600">Sudden salary spikes, unusual deductions</p>
              </div>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Attendance Patterns</p>
                <p className="text-xs text-gray-600">Overtime spikes, late arrival trends</p>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <Button 
            onClick={() => navigate('/anomaly-detection')}
            className="w-full"
          >
            Run Anomaly Detection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRAnomalyDetection;
