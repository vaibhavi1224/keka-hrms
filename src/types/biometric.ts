
export interface BiometricCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  created_at: string;
  updated_at: string;
}

export interface BiometricAuthState {
  isEnrolling: boolean;
  isAuthenticating: boolean;
  isSupported: boolean;
}
