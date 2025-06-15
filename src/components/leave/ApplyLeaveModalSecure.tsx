
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLeaveForm } from '@/hooks/useLeaveForm';
import LeaveFormErrors from './LeaveFormErrors';
import LeaveDateRangePicker from './LeaveDateRangePicker';
import LeaveTypeSelector from './LeaveTypeSelector';
import LeaveReasonInput from './LeaveReasonInput';

interface ApplyLeaveModalSecureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaveTypes: Array<{ id: string; name: string; max_leaves_per_year: number }>;
  leaveBalances: Array<{ leave_type_id: string; available_balance: number }>;
}

const ApplyLeaveModalSecure = ({ isOpen, onClose, onSuccess, leaveTypes, leaveBalances }: ApplyLeaveModalSecureProps) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    leaveType,
    setLeaveType,
    reason,
    setReason,
    isSubmitting,
    errors,
    handleSubmit
  } = useLeaveForm({ leaveTypes, leaveBalances, onSuccess, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <LeaveDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          
          <LeaveFormErrors errors={errors} />

          <LeaveTypeSelector
            leaveType={leaveType}
            leaveTypes={leaveTypes}
            onLeaveTypeChange={setLeaveType}
          />

          <LeaveReasonInput
            reason={reason}
            onReasonChange={setReason}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyLeaveModalSecure;
