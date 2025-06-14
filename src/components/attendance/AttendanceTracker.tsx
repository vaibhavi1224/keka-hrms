
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BiometricAuth from './BiometricAuth';
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
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricAction, setBiometricAction] = useState<'checkin' | 'checkout'>('checkin');
  const [useBiometric, setUseBiometric] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      checkTodayAttendance();
      fetchWeeklyAttendance();
      checkBiometricPreference();
    }
  }, [profile?.id]);

  const checkBiometricPreference = () => {
    const preference = localStorage.getItem('useBiometricAuth');
    setUseBiometric(preference === 'true');
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
          biometric_verified: showBiometric
        });

      if (error) throw error;

      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString());
      setShowBiometric(false);
      toast({
        title: "Clocked In Successfully",
        description: `Clocked in at ${new Date().toLocaleTimeString()}${showBiometric ? ' (Biometric Verified)' : ''}`,
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
          biometric_verified_out: showBiometric
        })
        .eq('user_id', profile.id)
        .eq('date', today);

      if (error) throw error;

      setIsCheckedIn(false);
      setCheckOutTime(new Date().toLocaleTimeString());
      setShowBiometric(false);
      toast({
        title: "Clocked Out Successfully",
        description: `Clocked out at ${new Date().toLocaleTimeString()}${showBiometric ? ' (Biometric Verified)' : ''}`,
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
    if (useBiometric) {
      setBiometricAction('checkin');
      setShowBiometric(true);
    } else {
      performCheckIn();
    }
  };

  const handleCheckOut = () => {
    if (useBiometric) {
      setBiometricAction('checkout');
      setShowBiometric(true);
    } else {
      performCheckOut();
    }
  };

  const handleBiometricSuccess = () => {
    if (biometricAction === 'checkin') {
      performCheckIn();
    } else {
      performCheckOut();
    }
  };

  const toggleBiometricPreference = () => {
    const newPreference = !useBiometric;
    setUseBiometric(newPreference);
    localStorage.setItem('useBiometricAuth', newPreference.toString());
    toast({
      title: newPreference ? "Biometric Enabled" : "Biometric Disabled",
      description: `Biometric authentication ${newPreference ? 'enabled' : 'disabled'} for attendance.`,
    });
  };

  if (showBiometric) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biometric Attendance</h1>
          <p className="text-gray-600 mt-1">Secure attendance tracking with biometric verification.</p>
        </div>
        <div className="flex justify-center">
          <BiometricAuth 
            onSuccess={handleBiometricSuccess}
            action={biometricAction}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceHeader 
        useBiometric={useBiometric}
        onToggleBiometric={toggleBiometricPreference}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodayAttendanceCard
          isCheckedIn={isCheckedIn}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          loading={loading}
          useBiometric={useBiometric}
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
