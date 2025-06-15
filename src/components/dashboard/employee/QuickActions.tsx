
import React, { useState } from 'react';
import { Clock, Calendar, DollarSign, User, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ProfileUpdateDialog from '@/components/profile/ProfileUpdateDialog';
import ResumeUploadDialog from '@/components/employee/ResumeUploadDialog';

const QuickActions = () => {
  const navigate = useNavigate();
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  const handleClockInOut = () => {
    navigate('/attendance');
  };

  const handleApplyLeave = () => {
    navigate('/leave');
  };

  const handleViewPayslip = () => {
    navigate('/payroll');
  };

  const quickActions = [
    { 
      title: 'Clock In/Out', 
      subtitle: 'Track attendance', 
      color: 'bg-blue-600 hover:bg-blue-700', 
      icon: Clock,
      action: handleClockInOut
    },
    { 
      title: 'Apply Leave', 
      subtitle: 'Request time off', 
      color: 'bg-green-600 hover:bg-green-700', 
      icon: Calendar,
      action: handleApplyLeave
    },
    { 
      title: 'View Payslip', 
      subtitle: 'Download payslip', 
      color: 'bg-purple-600 hover:bg-purple-700', 
      icon: DollarSign,
      action: handleViewPayslip
    },
    { 
      title: 'Upload Resume', 
      subtitle: 'Update resume', 
      color: 'bg-indigo-600 hover:bg-indigo-700', 
      icon: Upload,
      action: () => setShowResumeUpload(true)
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.subtitle}</div>
                </div>
              </Button>
            );
          })}
          
          <ProfileUpdateDialog>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto flex flex-col items-center space-y-2">
              <User className="w-6 h-6" />
              <div className="text-center">
                <div className="text-sm font-medium">Update Profile</div>
                <div className="text-xs opacity-90">Manage details</div>
              </div>
            </Button>
          </ProfileUpdateDialog>
        </div>
        
        <ResumeUploadDialog 
          open={showResumeUpload} 
          onOpenChange={setShowResumeUpload}
        />
      </CardContent>
    </Card>
  );
};

export default QuickActions;
