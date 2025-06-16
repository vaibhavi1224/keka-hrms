
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import HRDashboard from './HRDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import FirstTimeLoginModal from '@/components/onboarding/FirstTimeLoginModal';

const Dashboard = () => {
  const { profile, loading } = useProfile();
  const { needsOnboarding } = useOnboardingStatus();
  const [showOnboarding, setShowOnboarding] = useState(false);

  React.useEffect(() => {
    if (needsOnboarding && !loading) {
      setShowOnboarding(true);
    }
  }, [needsOnboarding, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {profile.role === 'hr' && <HRDashboard />}
      {profile.role === 'manager' && <ManagerDashboard />}
      {profile.role === 'employee' && <EmployeeDashboard />}
      
      <FirstTimeLoginModal 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default Dashboard;
