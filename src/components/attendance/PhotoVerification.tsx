
import React, { useState } from 'react';
import { CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PhotoVerificationProps {
  capturedImage: string;
  action: 'checkin' | 'checkout';
  onSuccess: () => void;
  onRetakePhoto: () => void;
}

const PhotoVerification = ({
  capturedImage,
  action,
  onSuccess,
  onRetakePhoto
}: PhotoVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const simulateFaceVerification = async () => {
    console.log('Starting face verification...');
    setIsVerifying(true);
    
    // Simulate face verification process (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate 90% success rate for demo purposes
    const isVerified = Math.random() > 0.1;
    
    setIsVerifying(false);
    console.log('Face verification result:', isVerified);
    
    if (isVerified) {
      toast({
        title: "Face Verified",
        description: `Identity confirmed for ${action === 'checkin' ? 'check-in' : 'check-out'}.`,
      });
      console.log('Calling onSuccess callback');
      onSuccess();
    } else {
      toast({
        title: "Verification Failed",
        description: "Face verification failed. Please try again.",
        variant: "destructive"
      });
      onRetakePhoto();
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <img
          src={capturedImage}
          alt="Captured face"
          className="w-full h-64 object-cover rounded-lg"
        />
        {isVerifying && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Verifying face...</p>
            </div>
          </div>
        )}
      </div>
      
      {!isVerifying ? (
        <div className="space-y-2">
          <Button onClick={simulateFaceVerification} className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Face & {action === 'checkin' ? 'Check In' : 'Check Out'}
          </Button>
          <Button variant="outline" onClick={onRetakePhoto} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        </div>
      ) : (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            Processing face verification... Please wait.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoVerification;
