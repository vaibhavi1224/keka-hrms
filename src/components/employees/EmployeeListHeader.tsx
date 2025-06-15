
import React from 'react';

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
    </div>
  );
};

export default EmployeeListHeader;
