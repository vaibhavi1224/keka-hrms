
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HRDataManagement from '@/components/hr/HRDataManagement';

interface HRQuickActionsProps {
  onInviteEmployee?: () => void;
}

const HRQuickActions = ({ onInviteEmployee }: HRQuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={onInviteEmployee || (() => navigate('/employee-management'))}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Add Employee</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/employees')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Manage Employees</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/leave')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Leave Management</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/payroll')}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Payroll</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <HRDataManagement />
    </div>
  );
};

export default HRQuickActions;
