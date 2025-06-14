
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HRComplianceAlerts = () => {
  const complianceAlerts = [
    { type: 'Document Expiry', message: '15 work permits expiring this month', severity: 'warning' },
    { type: 'Training Due', message: '23 employees need safety training', severity: 'info' },
    { type: 'Policy Update', message: 'New labor law requires action', severity: 'urgent' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span>Compliance Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complianceAlerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'urgent' ? 'bg-red-50 border-red-500' :
              alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{alert.type}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HRComplianceAlerts;
