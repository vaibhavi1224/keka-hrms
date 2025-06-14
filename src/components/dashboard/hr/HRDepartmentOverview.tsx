
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HRDepartmentOverview = () => {
  const departments = [
    { dept: 'Engineering', employees: 85, attendance: '96%', color: 'bg-blue-500' },
    { dept: 'Sales', employees: 42, attendance: '92%', color: 'bg-green-500' },
    { dept: 'Marketing', employees: 28, attendance: '94%', color: 'bg-purple-500' },
    { dept: 'Human Resources', employees: 12, attendance: '98%', color: 'bg-orange-500' },
    { dept: 'Finance', employees: 18, attendance: '95%', color: 'bg-red-500' },
    { dept: 'Operations', employees: 35, attendance: '97%', color: 'bg-teal-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departments.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${dept.color}`} />
                <div>
                  <p className="font-medium text-gray-900">{dept.dept}</p>
                  <p className="text-sm text-gray-600">{dept.employees} employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{dept.attendance}</p>
                <p className="text-sm text-gray-600">attendance</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HRDepartmentOverview;
