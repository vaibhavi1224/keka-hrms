
import React from 'react';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileUpdateDialog from '@/components/profile/ProfileUpdateDialog';
import EmployeeProfileForm from './EmployeeProfileForm';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';

interface EmployeeProfileProps {
  employee: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EmployeeProfile = ({ employee, onClose, onUpdate }: EmployeeProfileProps) => {
  const {
    formData,
    departments,
    managers,
    updateEmployeeMutation,
    handleChange,
    handleSubmit
  } = useEmployeeProfile(employee, onUpdate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Employee Profile
          </CardTitle>
          <div className="flex items-center gap-2">
            <ProfileUpdateDialog targetProfile={employee}>
              <Button variant="outline" size="sm">
                Detailed Profile
              </Button>
            </ProfileUpdateDialog>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EmployeeProfileForm
            formData={formData}
            departments={departments}
            managers={managers}
            isLoading={updateEmployeeMutation.isPending}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onCancel={onClose}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
