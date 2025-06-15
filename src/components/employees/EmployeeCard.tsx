
import React from 'react';
import { Badge } from '@/components/ui/badge';
import EmployeeActions from './EmployeeActions';

interface EmployeeCardProps {
  employee: any;
  isHR: boolean;
  onEdit: (employee: any) => void;
  onOffboard: (employee: any) => void;
}

const EmployeeCard = ({ employee, isHR, onEdit, onOffboard }: EmployeeCardProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'hr': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-lg">
            {employee.first_name?.[0]}{employee.last_name?.[0]}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {employee.first_name} {employee.last_name}
          </h3>
          <p className="text-sm text-gray-500">{employee.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge className={getRoleBadgeColor(employee.role)}>
              {employee.role?.toUpperCase()}
            </Badge>
            <Badge className={getStatusBadgeColor(employee.status || 'ACTIVE')}>
              {employee.status || 'ACTIVE'}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{employee.designation}</p>
          <p className="text-sm text-gray-500">{employee.department}</p>
          {employee.date_of_joining && (
            <p className="text-xs text-gray-400">
              Joined: {new Date(employee.date_of_joining).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {isHR && (
          <EmployeeActions
            employee={employee}
            onEdit={onEdit}
            onOffboard={onOffboard}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;
