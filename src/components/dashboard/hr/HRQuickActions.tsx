
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Database, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SeedDataButton from '@/components/hr/SeedDataButton';
import AddBankDetailsButton from '@/components/hr/AddBankDetailsButton';

interface HRQuickActionsProps {
  onInviteEmployee: () => void;
}

const HRQuickActions = ({ onInviteEmployee }: HRQuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onInviteEmployee}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite New Employee
        </Button>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Data Management</h4>
          <SeedDataButton />
          <AddBankDetailsButton />
        </div>
      </CardContent>
    </Card>
  );
};

export default HRQuickActions;
