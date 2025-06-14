
import React from 'react';
import { Users, Clock, DollarSign, FileText, CheckCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HRQuickActionsProps {
  onInviteEmployee: () => void;
}

const HRQuickActions = ({ onInviteEmployee }: HRQuickActionsProps) => {
  const quickActions = [
    { 
      title: 'Add New Employee', 
      color: 'bg-blue-600 hover:bg-blue-700', 
      icon: UserPlus,
      onClick: onInviteEmployee
    },
    { title: 'Process Payroll', color: 'bg-green-600 hover:bg-green-700', icon: DollarSign },
    { title: 'Generate Reports', color: 'bg-purple-600 hover:bg-purple-700', icon: FileText },
    { title: 'Review Compliance', color: 'bg-orange-600 hover:bg-orange-700', icon: CheckCircle },
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
                className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
                onClick={action.onClick}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HRQuickActions;
