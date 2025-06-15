
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateDateRange, validateTextLength, sanitizeInput } from '@/utils/validation/inputValidation';

interface ApplyLeaveModalSecureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaveTypes: Array<{ id: string; name: string; max_leaves_per_year: number }>;
  leaveBalances: Array<{ leave_type_id: string; available_balance: number }>;
}

const ApplyLeaveModalSecure = ({ isOpen, onClose, onSuccess, leaveTypes, leaveBalances }: ApplyLeaveModalSecureProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate dates
    if (!startDate || !endDate) {
      newErrors.dates = 'Both start and end dates are required';
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!validateDateRange(start, end)) {
        newErrors.dates = 'Invalid date range. Dates must be in the future and within one year';
      }

      // Calculate days requested
      const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysRequested > 30) {
        newErrors.dates = 'Leave duration cannot exceed 30 days';
      }

      // Check leave balance
      if (leaveType) {
        const balance = leaveBalances.find(b => b.leave_type_id === leaveType);
        if (balance && daysRequested > balance.available_balance) {
          newErrors.balance = `Insufficient leave balance. Available: ${balance.available_balance} days`;
        }
      }
    }

    // Validate leave type
    if (!leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    // Validate reason
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (!validateTextLength(reason, 500)) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: user.id,
          leave_type_id: leaveType,
          start_date: startDate,
          end_date: endDate,
          days_requested: daysRequested,
          reason: sanitizeInput(reason),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      onSuccess();
      onClose();
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setLeaveType('');
      setReason('');
      setErrors({});
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          
          {errors.dates && (
            <p className="text-sm text-red-600">{errors.dates}</p>
          )}
          {errors.balance && (
            <p className="text-sm text-red-600">{errors.balance}</p>
          )}

          <div>
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType} required>
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
            {errors.leaveType && (
              <p className="text-sm text-red-600">{errors.leaveType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for your leave request"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

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
