
import React from 'react';
import { Clock, Calendar, DollarSign, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClockInOut = () => {
    navigate('/attendance');
  };

  const handleApplyLeave = () => {
    navigate('/leave');
  };

  const handleViewPayslip = () => {
    navigate('/payroll');
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Update",
      description: "Profile management feature will be available soon.",
    });
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
      title: 'Update Profile', 
      subtitle: 'Manage details', 
      color: 'bg-orange-600 hover:bg-orange-700', 
      icon: Award,
      action: handleUpdateProfile
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
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
