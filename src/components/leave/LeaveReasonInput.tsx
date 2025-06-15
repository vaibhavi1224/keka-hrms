
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface LeaveReasonInputProps {
  reason: string;
  onReasonChange: (reason: string) => void;
}

const LeaveReasonInput = ({ reason, onReasonChange }: LeaveReasonInputProps) => {
  return (
    <div>
      <Label htmlFor="reason">Reason</Label>
      <Textarea
        id="reason"
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="Please provide a reason for your leave request"
        maxLength={500}
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        {reason.length}/500 characters
      </p>
    </div>
  );
};

export default LeaveReasonInput;
