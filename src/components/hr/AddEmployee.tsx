
import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAddEmployee } from '@/hooks/useAddEmployee';
import AddEmployeeForm from './AddEmployeeForm';

interface AddEmployeeProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployee = ({ onClose, onSuccess }: AddEmployeeProps) => {
  const { addEmployee, isLoading } = useAddEmployee();

  const handleSubmit = async (data: any) => {
    try {
      await addEmployee(data);
      onSuccess();
      onClose();
    } catch (error) {
      // Error is already handled by the hook with toast messages
      console.error('Error adding employee:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add New Employee
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AddEmployeeForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={onClose}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddEmployee;
