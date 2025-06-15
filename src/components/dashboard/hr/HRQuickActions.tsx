
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WorkflowManager from '@/components/employees/WorkflowManager';
import { UserPlus, Users, Building, ClipboardList } from 'lucide-react';

interface HRQuickActionsProps {
  onInviteEmployee: () => void;
}

const HRQuickActions = ({ onInviteEmployee }: HRQuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onInviteEmployee}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite New Employee
          </Button>
          
          <WorkflowManager />
          
          <Button 
            className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => window.location.href = '/employee-management'}
          >
            <Users className="w-4 h-4 mr-2" />
            Employee Management
          </Button>
          
          <Button 
            className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.location.href = '/employee-management?tab=departments'}
          >
            <Building className="w-4 h-4 mr-2" />
            Manage Departments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRQuickActions;
