
import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useProfile } from '@/hooks/useProfile';

interface BiometricAuthProps {
  onSuccess: () => void;
  action: 'checkin' | 'checkout';
}

const BiometricAuth = ({ onSuccess, action }: BiometricAuthProps) => {
  const { profile } = useProfile();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const {
    isSupported,
    isEnrolling,
    isAuthenticating,
    checkSupport,
    enrollBiometric,
    authenticateBiometric,
    checkEnrollment,
  } = useBiometricAuth(profile?.id || '');

  useEffect(() => {
    if (profile?.id) {
      checkSupport();
      checkEnrollmentStatus();
    }
  }, [profile?.id]);

  const checkEnrollmentStatus = async () => {
    const enrolled = await checkEnrollment();
    setIsEnrolled(enrolled);
  };

  const handleEnroll = async () => {
    const success = await enrollBiometric();
    if (success) {
      setIsEnrolled(true);
      setShowEnrollment(false);
    }
  };

  const handleAuthenticate = async () => {
    const success = await authenticateBiometric();
    if (success) {
      onSuccess();
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Biometric Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Your device doesn't support biometric authentication. Please use the regular attendance method.
          </p>
          <Button onClick={onSuccess} className="w-full">
            Continue with Regular {action === 'checkin' ? 'Check In' : 'Check Out'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isEnrolled && !showEnrollment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Set Up Biometric Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Secure your attendance with biometric authentication. Use your fingerprint or face recognition for quick and secure check-ins.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowEnrollment(true)} 
              className="w-full"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Set Up Biometrics
            </Button>
            <Button 
              variant="outline" 
              onClick={onSuccess} 
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showEnrollment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-blue-500" />
            Enroll Biometric
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Follow your device's prompts to register your biometric data. This will be used for secure attendance tracking.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={handleEnroll} 
              disabled={isEnrolling}
              className="w-full"
            >
              {isEnrolling ? 'Enrolling...' : 'Start Enrollment'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowEnrollment(false)} 
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-green-500" />
          Biometric {action === 'checkin' ? 'Check In' : 'Check Out'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Use your biometric authentication to {action === 'checkin' ? 'check in' : 'check out'} securely.
        </p>
        <div className="text-center py-4">
          <Fingerprint className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <p className="text-lg font-semibold">Touch your sensor or look at the camera</p>
        </div>
        <div className="space-y-2">
          <Button 
            onClick={handleAuthenticate} 
            disabled={isAuthenticating}
            className="w-full"
          >
            {isAuthenticating ? 'Authenticating...' : `Biometric ${action === 'checkin' ? 'Check In' : 'Check Out'}`}
          </Button>
          <Button 
            variant="outline" 
            onClick={onSuccess} 
            className="w-full"
          >
            Use Regular Method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricAuth;
