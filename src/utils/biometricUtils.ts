
// Convert ArrayBuffer to base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Check if WebAuthn is supported with more comprehensive checks
export const checkWebAuthnSupport = (): boolean => {
  try {
    // Check for basic WebAuthn support
    if (!window.PublicKeyCredential) {
      console.log('WebAuthn not supported: PublicKeyCredential not available');
      return false;
    }

    // Check for navigator.credentials
    if (!navigator.credentials) {
      console.log('WebAuthn not supported: navigator.credentials not available');
      return false;
    }

    // Check if running in secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.log('WebAuthn not supported: not in secure context (HTTPS required)');
      return false;
    }

    console.log('WebAuthn is supported');
    return true;
  } catch (error) {
    console.error('Error checking WebAuthn support:', error);
    return false;
  }
};

// Additional utility to check for platform authenticator support
export const checkPlatformAuthenticatorSupport = async (): Promise<boolean> => {
  try {
    if (!checkWebAuthnSupport()) {
      return false;
    }

    // Check if platform authenticator is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    console.log('Platform authenticator available:', available);
    return available;
  } catch (error) {
    console.error('Error checking platform authenticator support:', error);
    return false;
  }
};
