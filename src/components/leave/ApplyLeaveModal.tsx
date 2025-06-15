
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaveType {
  id: string;
  name: string;
  max_leaves_per_year: number;
}

const ApplyLeaveModal = ({ isOpen, onClose }: ApplyLeaveModalProps) => {
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['active-leave-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('id, name, max_leaves_per_year')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as LeaveType[];
    }
  });

  const applyLeaveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const selectedLeaveType = leaveTypes.find(lt => lt.id === data.leave_type_id);

      const { error } = await supabase
        .from('leave_requests')
        .insert([{
          user_id: profile?.id,
          leave_type_id: data.leave_type_id,
          leave_type: selectedLeaveType?.name || '',
          start_date: data.start_date,
          end_date: data.end_date,
          days_requested: days,
          reason: data.reason,
          status: 'pending'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request submitted successfully');
      setFormData({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to submit leave request');
      console.error('Error submitting leave request:', error);
    }
  });

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const days = calculateDays();
    if (days <= 0) {
      toast.error('End date must be after start date');
      return;
    }

    applyLeaveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="leave_type">Leave Type</Label>
            <Select
              value={formData.leave_type_id}
              onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((leaveType) => (
                  <SelectItem key={leaveType.id} value={leaveType.id}>
                    {leaveType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          {formData.start_date && formData.end_date && (
            <div className="text-sm text-gray-600">
              Total days: {calculateDays()}
            </div>
          )}

          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Enter reason for leave..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={applyLeaveMutation.isPending}>
              Submit Request
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyLeaveModal;
