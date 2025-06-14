
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmployeeCreatedSuccessProps {
  credentials: {
    email: string;
    password: string;
  };
  onClose: () => void;
}

const EmployeeCreatedSuccess = ({ credentials, onClose }: EmployeeCreatedSuccessProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-green-600">Employee Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Login Credentials</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-700">Email:</span>
                  <p className="font-mono text-sm bg-white p-2 rounded border">{credentials.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Password:</span>
                  <p className="font-mono text-sm bg-white p-2 rounded border">{credentials.password}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Please provide these credentials to the employee securely. They can use these to log in to the system.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCreatedSuccess;
