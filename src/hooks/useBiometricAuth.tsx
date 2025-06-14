
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BiometricAuthState } from '@/types/biometric';
import { checkWebAuthnSupport } from '@/utils/biometricUtils';
import { BiometricService } from '@/services/biometricService';

export const useBiometricAuth = (userId: string) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  // Check if WebAuthn is supported
  const checkSupport = () => {
    const supported = checkWebAuthnSupport();
    setIsSupported(supported);
    console.log('WebAuthn support check:', supported);
    return supported;
  };

  // Enroll biometric credential
  const enrollBiometric = async (): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required for biometric enrollment.",
        variant: "destructive"
      });
      return false;
    }

    if (!checkSupport()) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device or browser.",
        variant: "destructive"
      });
      return false;
    }

    setIsEnrolling(true);
    try {
      console.log('Starting biometric enrollment for user:', userId);

      // Check if already enrolled
      const alreadyEnrolled = await BiometricService.checkEnrollment(userId);
      if (alreadyEnrolled) {
        toast({
          title: "Already Enrolled",
          description: "Biometric authentication is already set up for this account.",
        });
        return true;
      }

      const credential = await BiometricService.createCredential(userId);
      if (!credential) {
        throw new Error('Failed to create biometric credential');
      }

      await BiometricService.storeCredential(userId, credential);

      toast({
        title: "Biometric Enrolled",
        description: "Your biometric authentication has been set up successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Biometric enrollment failed:', error);
      
      let errorMessage = error.message || "Failed to enroll biometric authentication.";
      
      // Provide user-friendly error messages
      if (errorMessage.includes('not supported')) {
        errorMessage = "Your device or browser doesn't support biometric authentication.";
      } else if (errorMessage.includes('cancelled')) {
        errorMessage = "Biometric enrollment was cancelled. Please try again.";
      } else if (errorMessage.includes('already exists')) {
        errorMessage = "A biometric credential already exists for this device.";
      }

      toast({
        title: "Enrollment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  // Authenticate using biometric
  const authenticateBiometric = async (): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required for biometric authentication.",
        variant: "destructive"
      });
      return false;
    }

    if (!checkSupport()) {
      return false;
    }

    setIsAuthenticating(true);
    try {
      console.log('Starting biometric authentication for user:', userId);

      const credentials = await BiometricService.getStoredCredentials(userId);
      if (!credentials || credentials.length === 0) {
        throw new Error('No biometric credentials found. Please enroll first.');
      }

      const assertion = await BiometricService.authenticateCredential(credentials);
      if (!assertion) {
        throw new Error('Authentication failed');
      }

      // Verify the assertion response
      const response = assertion.response as AuthenticatorAssertionResponse;
      if (!response.authenticatorData) {
        throw new Error('Invalid authentication response');
      }

      toast({
        title: "Authentication Successful",
        description: "Biometric authentication verified successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      
      let errorMessage = error.message || "Biometric authentication failed.";
      
      if (errorMessage.includes('No biometric credentials')) {
        errorMessage = "No biometric credentials found. Please set up biometric authentication first.";
      } else if (errorMessage.includes('cancelled')) {
        errorMessage = "Authentication was cancelled. Please try again.";
      }

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Check if user has enrolled biometrics
  const checkEnrollment = async (): Promise<boolean> => {
    if (!userId) return false;
    return BiometricService.checkEnrollment(userId);
  };

  return {
    isSupported,
    isEnrolling,
    isAuthenticating,
    checkSupport,
    enrollBiometric,
    authenticateBiometric,
    checkEnrollment,
  };
};
