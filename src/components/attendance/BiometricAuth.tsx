
import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, AlertCircle, Loader2, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface BiometricAuthProps {
  onSuccess: () => void;
  action: 'checkin' | 'checkout';
}

const BiometricAuth = ({ onSuccess, action }: BiometricAuthProps) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [checkingSupport, setCheckingSupport] = useState(true);
  const [enrollmentAttempts, setEnrollmentAttempts] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

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
    const initializeBiometric = async () => {
      if (profile?.id) {
        setCheckingSupport(true);
        
        // Check if WebAuthn is supported
        const supported = checkSupport();
        
        if (supported) {
          // Check if user is already enrolled
          const enrolled = await checkEnrollment();
          setIsEnrolled(enrolled);
        }
        
        setCheckingSupport(false);
      }
    };

    initializeBiometric();
  }, [profile?.id]);

  const handleEnroll = async () => {
    const newAttemptCount = enrollmentAttempts + 1;
    setEnrollmentAttempts(newAttemptCount);
    
    const success = await enrollBiometric();
    if (success) {
      setIsEnrolled(true);
      setShowEnrollment(false);
      setEnrollmentAttempts(0);
      toast({
        title: "Success!",
        description: "Biometric authentication has been set up successfully.",
      });
    } else if (newAttemptCount >= 2) {
      setShowTroubleshooting(true);
    }
  };

  const handleAuthenticate = async () => {
    const success = await authenticateBiometric();
    if (success) {
      onSuccess();
    }
  };

  const handleRetryEnrollment = () => {
    setEnrollmentAttempts(0);
    setShowTroubleshooting(false);
  };

  // Show loading while checking support
  if (checkingSupport) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking Biometric Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Checking if your device supports biometric authentication...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show not supported message
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
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your device or browser doesn't support biometric authentication. This could be because:
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>You're not using HTTPS (required for security)</li>
              <li>Your browser doesn't support WebAuthn</li>
              <li>Your device doesn't have biometric sensors</li>
            </ul>
            <Button onClick={onSuccess} className="w-full">
              Continue with Regular {action === 'checkin' ? 'Check In' : 'Check Out'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show troubleshooting after multiple failed attempts
  if (showTroubleshooting) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Troubleshooting Biometric Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Having trouble with biometric enrollment? Try these steps:
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
            <li>Make sure your browser allows biometric access</li>
            <li>Ensure your biometric sensor is clean and working</li>
            <li>Try refreshing the page and starting over</li>
            <li>Check that you're using a supported browser (Chrome, Edge, Safari)</li>
          </ul>
          <div className="space-y-2">
            <Button 
              onClick={handleRetryEnrollment} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={onSuccess} 
              className="w-full"
            >
              Skip Biometric Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show enrollment setup
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
            Secure your attendance with biometric authentication. Use your fingerprint, face recognition, or other biometric methods for quick and secure check-ins.
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

  // Show enrollment process
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
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> When prompted, allow your browser to access your biometric sensor and complete the full enrollment process.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Follow your device's prompts to register your biometric data. Make sure to use the same method you'll use for future check-ins.
          </p>
          {enrollmentAttempts > 0 && (
            <p className="text-sm text-amber-600">
              Attempt {enrollmentAttempts + 1} - Please ensure you complete the full enrollment process.
            </p>
          )}
          <div className="space-y-2">
            <Button 
              onClick={handleEnroll} 
              disabled={isEnrolling}
              className="w-full"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Start Enrollment'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowEnrollment(false)} 
              disabled={isEnrolling}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show authentication
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
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              `Biometric ${action === 'checkin' ? 'Check In' : 'Check Out'}`
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onSuccess} 
            disabled={isAuthenticating}
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
