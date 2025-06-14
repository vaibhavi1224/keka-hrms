
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
    return supported;
  };

  // Enroll biometric credential
  const enrollBiometric = async (): Promise<boolean> => {
    if (!checkSupport()) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device.",
        variant: "destructive"
      });
      return false;
    }

    setIsEnrolling(true);
    try {
      const credential = await BiometricService.createCredential(userId);
      if (!credential) {
        throw new Error('Failed to create credential');
      }

      await BiometricService.storeCredential(userId, credential);

      toast({
        title: "Biometric Enrolled",
        description: "Your biometric authentication has been set up successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Biometric enrollment failed:', error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll biometric authentication.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  // Authenticate using biometric
  const authenticateBiometric = async (): Promise<boolean> => {
    if (!checkSupport()) {
      return false;
    }

    setIsAuthenticating(true);
    try {
      const credentials = await BiometricService.getStoredCredentials(userId);
      if (!credentials || credentials.length === 0) {
        throw new Error('No biometric credentials found');
      }

      const assertion = await BiometricService.authenticateCredential(credentials);
      if (!assertion) {
        throw new Error('Authentication failed');
      }

      // In a real implementation, you would verify the assertion on the server
      // For now, we'll just check if we got a valid response
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
      toast({
        title: "Authentication Failed",
        description: error.message || "Biometric authentication failed.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Check if user has enrolled biometrics
  const checkEnrollment = async (): Promise<boolean> => {
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
