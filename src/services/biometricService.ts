
import { supabase } from '@/integrations/supabase/client';
import { BiometricCredential } from '@/types/biometric';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/biometricUtils';

export class BiometricService {
  static async createCredential(userId: string): Promise<PublicKeyCredential | null> {
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

    return credential;
  }

  static async storeCredential(userId: string, credential: PublicKeyCredential): Promise<void> {
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
  }

  static async getStoredCredentials(userId: string): Promise<BiometricCredential[]> {
    const { data: credentials, error } = await supabase
      .from('biometric_credentials')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return credentials || [];
  }

  static async authenticateCredential(credentials: BiometricCredential[]): Promise<PublicKeyCredential | null> {
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

    return assertion;
  }

  static async checkEnrollment(userId: string): Promise<boolean> {
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
  }
}
