
import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';

export const useOnboardingStatus = () => {
  const { profile, loading } = useProfile();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && profile) {
      // Check if user needs onboarding (first-time login)
      const hasCompletedOnboarding = profile.onboarding_status === 'completed';
      const hasProfilePicture = profile.profile_picture;
      
      // User needs onboarding if they haven't completed it or don't have a profile picture
      setNeedsOnboarding(!hasCompletedOnboarding && !hasProfilePicture);
    }
  }, [profile, loading]);

  return {
    needsOnboarding,
    loading
  };
};
