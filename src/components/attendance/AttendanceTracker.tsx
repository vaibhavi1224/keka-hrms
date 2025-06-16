import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import FaceVerification from './FaceVerification';
import AttendanceHeader from './AttendanceHeader';
import TodayAttendanceCard from './TodayAttendanceCard';
import LocationCard from './LocationCard';
import WeeklyAttendanceCard from './WeeklyAttendanceCard';
import { getCurrentPosition, getAddressFromCoordinates, isPositionAtOffice, PositionData } from '@/utils/geolocation';

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
  
  // New state variable for verification method preference
  const [verificationMethod, setVerificationMethod] = useState<'biometric' | 'geolocation'>('geolocation');
  
  // New state variables for geolocation
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    isValid: boolean;
    address: string;
    officeName: string | null;
  }>({
    latitude: null,
    longitude: null,
    isValid: false,
    address: 'Checking location...',
    officeName: null
  });

  useEffect(() => {
    if (profile?.id) {
      checkTodayAttendance();
      fetchWeeklyAttendance();
      checkFaceVerificationPreference();
      checkVerificationMethodPreference(); // Load verification method preference
      checkLocation(); // Check location when component loads
    }
  }, [profile?.id]);

  const checkFaceVerificationPreference = () => {
    const preference = localStorage.getItem('useFaceVerification');
    setUseFaceVerification(preference === 'true');
    console.log('Face verification preference:', preference);
  };

  // New function to check and load verification method preference
  const checkVerificationMethodPreference = () => {
    const preference = localStorage.getItem('verificationMethod') as 'biometric' | 'geolocation' | null;
    if (preference) {
      setVerificationMethod(preference);
      console.log('Verification method preference:', preference);
    }
  };

  // New function to update verification method preference
  const updateVerificationMethod = (method: 'biometric' | 'geolocation') => {
    setVerificationMethod(method);
    localStorage.setItem('verificationMethod', method);
    
    // If biometric is selected, also enable face verification
    if (method === 'biometric') {
      setUseFaceVerification(true);
      localStorage.setItem('useFaceVerification', 'true');
    }
    
    toast({
      title: `Verification Method Updated`,
      description: `You will now use ${method === 'biometric' ? 'biometric verification' : 'geolocation validation'} for attendance.`,
    });
  };

  // New function to check user's current location
  const checkLocation = async () => {
    setLocationLoading(true);
    
    try {
      // Get user's current position
      const position = await getCurrentPosition();
      
      // Check if position is at office - properly await the result
      const officeCheck = await isPositionAtOffice(position);
      
      // Get human-readable address
      const address = await getAddressFromCoordinates(position);
      
      // Update state with location information
      setCurrentLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        isValid: officeCheck.isValid,
        address: address,
        officeName: officeCheck.officeName
      });
      
      if (!officeCheck.isValid) {
        sonnerToast.warning("You are not at an approved office location");
      } else {
        sonnerToast.success(`Location verified: ${officeCheck.officeName}`);
      }
    } catch (error) {
      console.error('Location error:', error);
      sonnerToast.error(`Location error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setCurrentLocation({
        latitude: null,
        longitude: null,
        isValid: false,
        address: 'Failed to get location. Please check your browser permissions.',
        officeName: null
      });
    } finally {
      setLocationLoading(false);
    }
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
    console.log('Performing check-in...');
    if (!profile?.id) {
      console.error('No profile ID available');
      toast({
        title: "Clock In Failed",
        description: "User profile not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    // Only verify location if using geolocation method
    if (verificationMethod === 'geolocation' && !currentLocation.isValid) {
      toast({
        title: "Location Error",
        description: "You must be at an approved office location to check in",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // For record-keeping, determine which verification method was used
      const usingBiometric = verificationMethod === 'biometric'; // This means biometric was used
      
      console.log('Preparing attendance data:', {
        userId: profile.id,
        date: today,
        timestamp: now
      });
      
      // Use only the core fields that are definitely in the database schema
      // to avoid any potential type mismatches
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          user_id: profile.id,
          date: today,
          check_in_time: now,
          status: 'present',
          biometric_verified: usingBiometric,
          // Omitting potentially problematic fields
          notes: `Check-in via ${verificationMethod} verification`
        })
        .select();

      if (error) {
        console.error('Supabase error during check-in:', error);
        throw error;
      }

      console.log('Check-in successful, data:', data);
      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString());
      setShowFaceVerification(false);
      
      let verificationMsg = '';
      if (verificationMethod === 'biometric') {
        verificationMsg = ' (Face Verified)';
      } else {
        verificationMsg = ' (Location Verified)';
      }
      
      toast({
        title: "Clocked In Successfully",
        description: `Clocked in at ${new Date().toLocaleTimeString()}${verificationMsg}`,
      });
    } catch (error) {
      console.error('Clock in error:', error);
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', typeof error);
      }
      
      // Show error toast to user
      toast({
        title: "Clock In Failed",
        description: error instanceof Error ? error.message : "Failed to clock in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performCheckOut = async () => {
    console.log('Performing check-out...');
    if (!profile?.id) {
      console.error('No profile ID available');
      toast({
        title: "Clock Out Failed",
        description: "User profile not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    // Only verify location if using geolocation method
    if (verificationMethod === 'geolocation' && !currentLocation.isValid) {
      toast({
        title: "Location Error",
        description: "You must be at an approved office location to check out",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // For record-keeping, determine which verification method was used
      const usingBiometric = verificationMethod === 'biometric';
      
      console.log('Preparing checkout data:', {
        userId: profile.id,
        date: today,
        timestamp: now
      });
      
      // Use only the core fields that are definitely in the database schema
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now,
          updated_at: now,
          biometric_verified_out: usingBiometric,
          // Use notes field to store verification method info
          notes: `Check-out via ${verificationMethod} verification`
        })
        .eq('user_id', profile.id)
        .eq('date', today);

      if (error) {
        console.error('Supabase error during check-out:', error);
        throw error;
      }

      setIsCheckedIn(false);
      setCheckOutTime(new Date().toLocaleTimeString());
      setShowFaceVerification(false);
      console.log('Check-out successful');
      
      let verificationMsg = '';
      if (verificationMethod === 'biometric') {
        verificationMsg = ' (Face Verified)';
      } else {
        verificationMsg = ' (Location Verified)';
      }
      
      toast({
        title: "Clocked Out Successfully",
        description: `Clocked out at ${new Date().toLocaleTimeString()}${verificationMsg}`,
      });
    } catch (error) {
      console.error('Clock out error:', error);
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', typeof error);
      }
      
      toast({
        title: "Clock Out Failed",
        description: error instanceof Error ? error.message : "Failed to clock out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    console.log('Check-in button clicked, verification method:', verificationMethod);
    
    if (verificationMethod === 'geolocation') {
      // First verify location is valid
      if (!currentLocation.isValid) {
        toast({
          title: "Location Error",
          description: "You are not at an office location. Please go to an approved office location to check in.",
          variant: "destructive"
        });
        return;
      }
      
      // If location is valid, proceed with check-in
      performCheckIn();
    } else if (verificationMethod === 'biometric') {
      // Start face verification process
      console.log('Starting face verification for check-in');
      setFaceVerificationAction('checkin');
      setShowFaceVerification(true);
    }
  };

  const handleCheckOut = () => {
    console.log('Check-out button clicked, verification method:', verificationMethod);
    
    if (verificationMethod === 'geolocation') {
      // First verify location is valid
      if (!currentLocation.isValid) {
        toast({
          title: "Location Error",
          description: "You are not at an office location. Please go to an approved office location to check out.",
          variant: "destructive"
        });
        return;
      }
      
      // If location is valid, proceed with check-out
      performCheckOut();
    } else if (verificationMethod === 'biometric') {
      // Start face verification process
      console.log('Starting face verification for check-out');
      setFaceVerificationAction('checkout');
      setShowFaceVerification(true);
    }
  };

  const handleFaceVerificationSuccess = () => {
    console.log('Face verification successful, action:', faceVerificationAction);
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
    console.log('Face verification preference updated:', newPreference);
    toast({
      title: newPreference ? "Face Verification Enabled" : "Face Verification Disabled",
      description: `Face verification ${newPreference ? 'enabled' : 'disabled'} for attendance.`,
    });
  };

  if (showFaceVerification) {
    console.log('Rendering face verification component');
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
        verificationMethod={verificationMethod}
        onChangeVerificationMethod={updateVerificationMethod}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodayAttendanceCard
          isCheckedIn={isCheckedIn}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          loading={loading}
          useBiometric={verificationMethod === 'biometric'}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          verificationMethod={verificationMethod}
        />

        <div className="space-y-6">
          <LocationCard 
            isLocationValid={currentLocation.isValid}
            onRefreshLocation={checkLocation}
            loading={locationLoading}
            currentAddress={currentLocation.address}
            isRequired={verificationMethod === 'geolocation'}
          />
          <WeeklyAttendanceCard weeklyAttendance={weeklyAttendance} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
