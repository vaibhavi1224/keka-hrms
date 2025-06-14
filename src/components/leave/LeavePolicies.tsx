
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LeavePolicies = () => {
  const policies = [
    {
      title: 'Annual Leave',
      description: 'All employees are entitled to 21 days of annual leave per calendar year.',
      borderColor: 'border-blue-500'
    },
    {
      title: 'Sick Leave',
      description: 'Up to 10 days of sick leave per year. Medical certificate required for leaves exceeding 3 consecutive days.',
      borderColor: 'border-green-500'
    },
    {
      title: 'Emergency Leave',
      description: 'Emergency leave may be granted at management discretion for unforeseen circumstances.',
      borderColor: 'border-purple-500'
    },
    {
      title: 'Maternity/Paternity Leave',
      description: 'Maternity leave: 12 weeks. Paternity leave: 2 weeks. Please contact HR for detailed policy.',
      borderColor: 'border-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Policies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {policies.map((policy, index) => (
            <div key={index} className={`border-l-4 ${policy.borderColor} pl-4`}>
              <h3 className="font-semibold text-gray-900 mb-2">{policy.title}</h3>
              <p className="text-gray-600">{policy.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeavePolicies;
