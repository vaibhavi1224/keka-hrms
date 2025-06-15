
import React from 'react';
import { Users, UserPlus, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmployeeStatsProps {
  totalEmployees: number;
  totalDepartments: number;
  hrCount: number;
  managerCount: number;
}

const EmployeeStats = ({ totalEmployees, totalDepartments, hrCount, managerCount }: EmployeeStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900">{totalDepartments}</p>
            </div>
            <Filter className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HR Staff</p>
              <p className="text-3xl font-bold text-gray-900">{hrCount}</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-3xl font-bold text-gray-900">{managerCount}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStats;
