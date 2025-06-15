
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, DollarSign, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HRQuickActionsProps {
  onInviteEmployee?: () => void;
  onOpenAttritionPredictor?: () => void;
}

const HRQuickActions = ({ onInviteEmployee, onOpenAttritionPredictor }: HRQuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Button 
            className="min-h-16 p-4 flex items-center justify-start space-x-4 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onInviteEmployee || (() => navigate('/employee-management'))}
          >
            <Users className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-medium">Add Employee</span>
            </div>
          </Button>
          
          <Button 
            className="min-h-16 p-4 flex items-center justify-start space-x-4 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate('/employees')}
          >
            <Users className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-medium">Manage Employees</span>
            </div>
          </Button>
          
          <Button 
            className="min-h-16 p-4 flex items-center justify-start space-x-4 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => navigate('/leave')}
          >
            <Calendar className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-medium">Leave Management</span>
            </div>
          </Button>
          
          <Button 
            className="min-h-16 p-4 flex items-center justify-start space-x-4 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => navigate('/payroll')}
          >
            <DollarSign className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-medium">Payroll</span>
            </div>
          </Button>

          <Button   
            className="min-h-16 p-4 flex items-center justify-start space-x-4 bg-aqua-600 hover:bg-aqua-700 text-white"
            onClick={onOpenAttritionPredictor}
            >
            <Brain className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-purple-600">AI Attrition</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRQuickActions;
