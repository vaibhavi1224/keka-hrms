
import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployeeListHeaderProps {
  isHR: boolean;
  onAddEmployee: () => void;
}

const EmployeeListHeader = ({ isHR, onAddEmployee }: EmployeeListHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-gray-600 mt-1">Manage your organization's workforce</p>
      </div>
      {isHR && (
        <Button 
          onClick={onAddEmployee}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      )}
    </div>
  );
};

export default EmployeeListHeader;
