
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import WelcomeHeader from './employee/WelcomeHeader';
import PersonalStats from './employee/PersonalStats';
import QuickActions from './employee/QuickActions';
import TodaySchedule from './employee/TodaySchedule';
import PerformanceMetrics from './employee/PerformanceMetrics';
import RecentAnnouncements from './employee/RecentAnnouncements';
import WeeklySummary from './employee/WeeklySummary';

const EmployeeDashboard = () => {
  const { profile } = useProfile();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      checkTodayAttendance();
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

      if (data && data.check_in_time && !data.check_out_time) {
        setIsCheckedIn(true);
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <WelcomeHeader 
        isCheckedIn={isCheckedIn}
        setIsCheckedIn={setIsCheckedIn}
        loading={loading}
        setLoading={setLoading}
      />

      <PersonalStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <TodaySchedule />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetrics />
        <RecentAnnouncements />
      </div>

      <WeeklySummary />
    </div>
  );
};

export default EmployeeDashboard;
