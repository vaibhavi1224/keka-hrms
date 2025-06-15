
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FaceVerification from './FaceVerification';
import AttendanceHeader from './AttendanceHeader';
import TodayAttendanceCard from './TodayAttendanceCard';
import LocationCard from './LocationCard';
import WeeklyAttendanceCard from './WeeklyAttendanceCard';

const AttendanceTracker = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [faceVerificationAction, setFaceVerificationAction] = useState<'checkin' | 'checkout'>('checkin');
  const [useFaceVerification, setUseFaceVerification] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      checkTodayAttendance();
      fetchWeeklyAttendance();
      checkFaceVerificationPreference();
    }
  }, [profile?.id]);

  const checkFaceVerificationPreference = () => {
    const preference = localStorage.getItem('useFaceVerification');
    setUseFaceVerification(preference === 'true');
  };

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

  const performCheckIn = async () => {
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
          status: 'present',
          biometric_verified: showFaceVerification
        });

      if (error) throw error;

      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString());
      setShowFaceVerification(false);
      toast({
        title: "Clocked In Successfully",
        description: `Clocked in at ${new Date().toLocaleTimeString()}${showFaceVerification ? ' (Face Verified)' : ''}`,
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

  const performCheckOut = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now,
          updated_at: now,
          biometric_verified_out: showFaceVerification
        })
        .eq('user_id', profile.id)
        .eq('date', today);

      if (error) throw error;

      setIsCheckedIn(false);
      setCheckOutTime(new Date().toLocaleTimeString());
      setShowFaceVerification(false);
      toast({
        title: "Clocked Out Successfully",
        description: `Clocked out at ${new Date().toLocaleTimeString()}${showFaceVerification ? ' (Face Verified)' : ''}`,
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

  const handleCheckIn = () => {
    if (useFaceVerification) {
      setFaceVerificationAction('checkin');
      setShowFaceVerification(true);
    } else {
      performCheckIn();
    }
  };

  const handleCheckOut = () => {
    if (useFaceVerification) {
      setFaceVerificationAction('checkout');
      setShowFaceVerification(true);
    } else {
      performCheckOut();
    }
  };

  const handleFaceVerificationSuccess = () => {
    if (faceVerificationAction === 'checkin') {
      performCheckIn();
    } else {
      performCheckOut();
    }
  };

  const toggleFaceVerificationPreference = () => {
    const newPreference = !useFaceVerification;
    setUseFaceVerification(newPreference);
    localStorage.setItem('useFaceVerification', newPreference.toString());
    toast({
      title: newPreference ? "Face Verification Enabled" : "Face Verification Disabled",
      description: `Face verification ${newPreference ? 'enabled' : 'disabled'} for attendance.`,
    });
  };

  if (showFaceVerification) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Face Verification Attendance</h1>
          <p className="text-gray-600 mt-1">Secure attendance tracking with facial verification.</p>
        </div>
        <div className="flex justify-center">
          <FaceVerification 
            onSuccess={handleFaceVerificationSuccess}
            action={faceVerificationAction}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceHeader 
        useBiometric={useFaceVerification}
        onToggleBiometric={toggleFaceVerificationPreference}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodayAttendanceCard
          isCheckedIn={isCheckedIn}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          loading={loading}
          useBiometric={useFaceVerification}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />

        <div className="space-y-6">
          <LocationCard />
          <WeeklyAttendanceCard weeklyAttendance={weeklyAttendance} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
