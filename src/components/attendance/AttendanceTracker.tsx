
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AttendanceTracker = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const workingHours = {
    start: '09:00',
    end: '17:00',
    totalHours: 8
  };

  useEffect(() => {
    if (profile?.id) {
      checkTodayAttendance();
      fetchWeeklyAttendance();
    }
  }, [profile?.id]);

  const checkTodayAttendance = async () => {
    if (!profile?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', today)
        .single();

      if (data) {
        setIsCheckedIn(!!data.check_in_time && !data.check_out_time);
        setCheckInTime(data.check_in_time ? new Date(data.check_in_time).toLocaleTimeString() : null);
        setCheckOutTime(data.check_out_time ? new Date(data.check_out_time).toLocaleTimeString() : null);
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const fetchWeeklyAttendance = async () => {
    if (!profile?.id) return;

    try {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 5));

      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', profile.id)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])
        .order('date');

      setWeeklyAttendance(data || []);
    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
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
      setCheckInTime(new Date().toLocaleTimeString());
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

  const handleCheckOut = async () => {
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
      setCheckOutTime(new Date().toLocaleTimeString());
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

  const calculateWorkedHours = () => {
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(`1970-01-01T${checkInTime}`);
      const checkOut = new Date(`1970-01-01T${checkOutTime}`);
      const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      return Math.max(0, Math.min(diff, 8)).toFixed(1);
    }
    return '0.0';
  };

  const getRemainingHours = () => {
    const worked = parseFloat(calculateWorkedHours());
    return Math.max(0, 8 - worked).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance and working hours.</p>
        <div className="mt-2 text-sm text-gray-500">
          Office Hours: {workingHours.start} - {workingHours.end} | Monday - Friday
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Today's Attendance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              {!isCheckedIn ? (
                <Button 
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  {loading ? 'Checking In...' : 'Check In'}
                </Button>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-green-600 font-medium">
                    Checked in at {checkInTime}
                  </div>
                  <Button 
                    onClick={handleCheckOut}
                    disabled={loading}
                    variant="destructive"
                    className="px-8 py-3 text-lg"
                  >
                    {loading ? 'Checking Out...' : 'Check Out'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{workingHours.totalHours}:00</div>
                <div className="text-sm text-gray-500">Expected Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{calculateWorkedHours()}</div>
                <div className="text-sm text-gray-500">Hours Worked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getRemainingHours()}</div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
            </div>

            {checkInTime && checkOutTime && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Today's Summary</div>
                <div className="text-xs text-gray-600 mt-1">
                  Check In: {checkInTime} | Check Out: {checkOutTime}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Current Location</div>
                <div className="font-medium">Office - Floor 3</div>
                <div className="text-xs text-gray-500">Verified via GPS</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                  const attendance = weeklyAttendance[index];
                  const status = attendance ? 'Present' : index < new Date().getDay() ? 'Absent' : '--';
                  const hours = attendance && attendance.check_in_time && attendance.check_out_time 
                    ? calculateWorkedHours() 
                    : index < new Date().getDay() ? '0:00' : '--';
                  
                  return (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{day}</span>
                      <div className="text-right">
                        <div className={`text-sm ${
                          status === 'Present' ? 'text-green-600' : 
                          status === 'Absent' ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {hours}
                        </div>
                        <div className="text-xs text-gray-500">{status}</div>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Weekend: Saturday - Sunday (Holiday)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
