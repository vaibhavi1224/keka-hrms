
import React from 'react';
import { MoreVertical, Edit, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface EmployeeActionsProps {
  employee: any;
  onEdit: (employee: any) => void;
  onOffboard: (employee: any) => void;
}

const EmployeeActions = ({ employee, onEdit, onOffboard }: EmployeeActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(employee)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOffboard(employee)}>
          <UserMinus className="w-4 h-4 mr-2" />
          Offboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeActions;
