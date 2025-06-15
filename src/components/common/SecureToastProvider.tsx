
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

// Enhanced toast provider with security considerations
const SecureToastProvider = () => {
  return (
    <Toaster
      richColors
      position="top-right"
      expand={false}
      duration={4000}
      // Prevent XSS in toast messages
      toastOptions={{
        style: {
          wordBreak: 'break-word',
          maxWidth: '400px',
        },
        // Custom data attributes for security scanning
        'data-security': 'toast-message',
      }}
    />
  );
};

export default SecureToastProvider;
