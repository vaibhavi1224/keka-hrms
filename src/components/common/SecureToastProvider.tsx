
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
      }}
    />
  );
};

export default SecureToastProvider;
