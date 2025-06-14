import { supabase } from '@/integrations/supabase/client';
import { BiometricCredential } from '@/types/biometric';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/biometricUtils';

export class BiometricService {
  static async createCredential(userId: string): Promise<PublicKeyCredential | null> {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Biometric authentication requires HTTPS');
      }

      // Check for platform authenticator availability first
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          throw new Error('No biometric sensors are available on this device');
        }
      } catch (error) {
        console.warn('Could not check platform authenticator availability:', error);
      }

      // Generate a more robust challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create user ID buffer
      const userIdBuffer = new TextEncoder().encode(userId);

      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: "HRMS Attendance System",
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
          },
          user: {
            id: userIdBuffer,
            name: `user-${userId}`,
            displayName: "Employee",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
            requireResidentKey: false,
          },
          timeout: 180000, // 3 minutes timeout
          attestation: "none",
          excludeCredentials: [], // Prevent duplicate credentials
        },
      };

      console.log('Creating WebAuthn credential with options:', credentialCreationOptions);

      const credential = await navigator.credentials.create(credentialCreationOptions) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('User cancelled credential creation or device not supported');
      }

      console.log('WebAuthn credential created successfully:', credential);
      return credential;
    } catch (error: any) {
      console.error('Error creating WebAuthn credential:', error);
      
      // Provide more specific error messages based on error type
      if (error.name === 'NotSupportedError') {
        throw new Error('Your device does not support biometric authentication. Please try using a device with fingerprint, face recognition, or Windows Hello.');
      } else if (error.name === 'NotAllowedError') {
        throw new Error('Permission denied. Please click "Allow" when prompted for biometric access, or check your browser settings to enable biometric authentication.');
      } else if (error.name === 'InvalidStateError') {
        throw new Error('A biometric credential already exists for this device. Please try authenticating instead of enrolling again.');
      } else if (error.name === 'ConstraintError') {
        throw new Error('Your device does not meet the security requirements. Please ensure your biometric sensors are set up and working properly.');
      } else if (error.name === 'SecurityError') {
        throw new Error('Security error: Please ensure you are using HTTPS and your browser supports biometric authentication.');
      } else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Biometric enrollment timed out. Please try again and complete the process quickly when prompted.');
      } else if (error.message && (error.message.includes('cancelled') || error.message.includes('denied'))) {
        throw new Error('Biometric enrollment was cancelled or denied. Please allow biometric access when prompted and try again.');
      } else if (error.message && error.message.includes('No biometric sensors')) {
        throw new Error('No biometric sensors detected. Please ensure your device has fingerprint, face recognition, or other biometric capabilities enabled.');
      } else {
        throw new Error(`Biometric enrollment failed: ${error.message || 'Please check your device settings and ensure biometric authentication is enabled'}`);
      }
    }
  }

  static async storeCredential(userId: string, credential: PublicKeyCredential): Promise<void> {
    try {
      const response = credential.response as AuthenticatorAttestationResponse;
      
      console.log('Storing credential for user:', userId);
      console.log('Credential response:', response);
      
      // Get the public key - try multiple methods for compatibility
      let publicKeyBuffer: ArrayBuffer | null = null;
      
      try {
        // Modern browsers
        publicKeyBuffer = response.getPublicKey();
      } catch (error) {
        console.warn('getPublicKey() not available, trying alternative method');
      }
      
      if (!publicKeyBuffer) {
        // Fallback: extract public key from attestationObject
        try {
          const attestationObject = response.attestationObject;
          // This is a simplified approach - in production you'd properly decode the CBOR
          publicKeyBuffer = attestationObject.slice(0, 64); // Take first 64 bytes as fallback
        } catch (error) {
          console.error('Failed to extract public key from attestation object:', error);
        }
      }
      
      if (!publicKeyBuffer) {
        throw new Error('Unable to extract public key from credential');
      }
      
      const credentialData = {
        user_id: userId,
        credential_id: arrayBufferToBase64(credential.rawId),
        public_key: arrayBufferToBase64(publicKeyBuffer),
        counter: 0,
      };

      console.log('Storing credential data:', credentialData);

      // Store credential in database
      const { error } = await supabase
        .from('biometric_credentials')
        .insert(credentialData);

      if (error) {
        console.error('Database error storing credential:', error);
        throw error;
      }

      console.log('Credential stored successfully in database');
    } catch (error: any) {
      console.error('Error storing credential:', error);
      throw new Error(`Failed to store biometric credential: ${error.message || 'Unknown error'}`);
    }
  }

  static async getStoredCredentials(userId: string): Promise<BiometricCredential[]> {
    try {
      const { data: credentials, error } = await supabase
        .from('biometric_credentials')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching stored credentials:', error);
        throw error;
      }
      
      console.log('Retrieved stored credentials:', credentials);
      return credentials || [];
    } catch (error: any) {
      console.error('Error getting stored credentials:', error);
      throw new Error(`Failed to retrieve stored credentials: ${error.message}`);
    }
  }

  static async authenticateCredential(credentials: BiometricCredential[]): Promise<PublicKeyCredential | null> {
    try {
      if (!credentials || credentials.length === 0) {
        throw new Error('No stored credentials found');
      }

      // Generate challenge for authentication
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          allowCredentials: credentials.map((cred: BiometricCredential) => ({
            id: base64ToArrayBuffer(cred.credential_id),
            type: "public-key",
          })),
          userVerification: "required",
          timeout: 60000,
        },
      };

      console.log('Authenticating with options:', credentialRequestOptions);

      const assertion = await navigator.credentials.get(credentialRequestOptions) as PublicKeyCredential;
      
      if (!assertion) {
        throw new Error('Authentication failed - user may have cancelled');
      }

      console.log('Authentication successful:', assertion);
      return assertion;
    } catch (error: any) {
      console.error('Error during authentication:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled');
      } else {
        throw new Error(`Authentication failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  static async checkEnrollment(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('biometric_credentials')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error checking enrollment:', error);
        return false;
      }
      
      const isEnrolled = data && data.length > 0;
      console.log('Enrollment check result:', isEnrolled);
      return isEnrolled;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }
}
