
import React from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useAddEmployee } from '@/hooks/useAddEmployee';
import AddEmployeeForm from './AddEmployeeForm';
import EmployeeCreatedSuccess from './EmployeeCreatedSuccess';

interface AddEmployeeProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployee = ({ onClose, onSuccess }: AddEmployeeProps) => {
  const { profile } = useProfile();
  const {
    formData,
    showPassword,
    setShowPassword,
    generatedCredentials,
    departments,
    generatePassword,
    addEmployeeMutation,
    handleSubmit,
    handleChange,
    resetForm
  } = useAddEmployee(onSuccess);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (generatedCredentials) {
    return (
      <EmployeeCreatedSuccess
        credentials={generatedCredentials}
        onClose={handleClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Employee
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddEmployeeForm
            formData={formData}
            showPassword={showPassword}
            departments={departments}
            isLoading={addEmployeeMutation.isPending}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onGeneratePassword={generatePassword}
            onCancel={handleClose}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmployee;
