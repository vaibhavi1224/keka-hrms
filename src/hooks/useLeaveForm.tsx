
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateDateRange, validateTextLength, sanitizeInput } from '@/utils/validation/inputValidation';

interface UseLeaveFormProps {
  leaveTypes: Array<{ id: string; name: string; max_leaves_per_year: number }>;
  leaveBalances: Array<{ leave_type_id: string; available_balance: number }>;
  onSuccess: () => void;
  onClose: () => void;
}

export const useLeaveForm = ({ leaveTypes, leaveBalances, onSuccess, onClose }: UseLeaveFormProps) => {
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

      // Get the leave type name for the legacy leave_type field
      const selectedLeaveType = leaveTypes.find(lt => lt.id === leaveType);

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: user.id,
          leave_type_id: leaveType,
          leave_type: selectedLeaveType?.name || '',
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
      resetForm();
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

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setLeaveType('');
    setReason('');
    setErrors({});
  };

  return {
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
    handleSubmit,
    resetForm
  };
};
