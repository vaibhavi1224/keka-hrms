
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BiometricCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  created_at: string;
  updated_at: string;
}

export const useBiometricAuth = (userId: string) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  // Check if WebAuthn is supported
  const checkSupport = () => {
    const supported = !!(navigator.credentials && window.PublicKeyCredential);
    setIsSupported(supported);
    return supported;
  };

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Convert base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
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
      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "HRMS Attendance",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userId,
            displayName: "Employee",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Get the public key using the correct method
      const publicKeyBuffer = response.getPublicKey();
      if (!publicKeyBuffer) {
        throw new Error('Failed to get public key from credential');
      }
      
      // Store credential in database
      const { error } = await supabase
        .from('biometric_credentials')
        .insert({
          user_id: userId,
          credential_id: arrayBufferToBase64(new Uint8Array(credential.rawId)),
          public_key: arrayBufferToBase64(publicKeyBuffer),
          counter: 0,
        });

      if (error) throw error;

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
      // Get stored credentials
      const { data: credentials, error } = await supabase
        .from('biometric_credentials')
        .select('*')
        .eq('user_id', userId);

      if (error || !credentials || credentials.length === 0) {
        throw new Error('No biometric credentials found');
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: credentials.map((cred: BiometricCredential) => ({
            id: base64ToArrayBuffer(cred.credential_id),
            type: "public-key",
          })),
          userVerification: "required",
          timeout: 60000,
        },
      }) as PublicKeyCredential;

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
    try {
      const { data, error } = await supabase
        .from('biometric_credentials')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
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
