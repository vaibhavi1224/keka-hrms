
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WelcomeHeaderProps {
  isCheckedIn: boolean;
  setIsCheckedIn: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const WelcomeHeader = ({ isCheckedIn, setIsCheckedIn, loading, setLoading }: WelcomeHeaderProps) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const firstName = profile?.first_name || 'User';

  const handleClockIn = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // Check if already clocked in today
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', today)
        .single();

      if (existingAttendance && existingAttendance.check_in_time) {
        toast({
          title: "Already Clocked In",
          description: "You have already clocked in today.",
          variant: "destructive"
        });
        return;
      }

      // Create or update attendance record
      const { error } = await supabase
        .from('attendance')
        .upsert({
          user_id: profile.id,
          date: today,
          check_in_time: now,
          status: 'present'
        });

      if (error) throw error;

      setIsCheckedIn(true);
      toast({
        title: "Clocked In Successfully",
        description: `Clocked in at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Clock in error:', error);
      toast({
        title: "Clock In Failed",
        description: "Failed to clock in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now,
          updated_at: now
        })
        .eq('user_id', profile.id)
        .eq('date', today);

      if (error) throw error;

      setIsCheckedIn(false);
      toast({
        title: "Clocked Out Successfully",
        description: `Clocked out at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Clock out error:', error);
      toast({
        title: "Clock Out Failed",
        description: "Failed to clock out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimesheet = () => {
    window.location.href = '/attendance';
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 mt-1">Here's your personal dashboard and today's overview</p>
        <div className="mt-2 text-sm text-gray-500">
          Office Hours: 9:00 AM - 5:00 PM | Monday - Friday
        </div>
      </div>
      <div className="flex space-x-3">
        {!isCheckedIn ? (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleClockIn}
            disabled={loading}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {loading ? 'Clocking In...' : 'Clock In'}
          </Button>
        ) : (
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleClockOut}
            disabled={loading}
          >
            <Clock className="w-4 h-4 mr-2" />
            {loading ? 'Clocking Out...' : 'Clock Out'}
          </Button>
        )}
        <Button variant="outline" onClick={handleViewTimesheet}>
          <Clock className="w-4 h-4 mr-2" />
          View Timesheet
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;
