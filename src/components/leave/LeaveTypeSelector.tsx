
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeaveTypeSelectorProps {
  leaveType: string;
  leaveTypes: Array<{ id: string; name: string; max_leaves_per_year: number }>;
  onLeaveTypeChange: (value: string) => void;
}

const LeaveTypeSelector = ({ leaveType, leaveTypes, onLeaveTypeChange }: LeaveTypeSelectorProps) => {
  return (
    <div>
      <Label htmlFor="leaveType">Leave Type</Label>
      <Select value={leaveType} onValueChange={onLeaveTypeChange} required>
        <SelectTrigger>
          <SelectValue placeholder="Select leave type" />
        </SelectTrigger>
        <SelectContent>
          {leaveTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LeaveTypeSelector;
