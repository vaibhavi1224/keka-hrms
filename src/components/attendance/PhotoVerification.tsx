import React, { useState, useEffect } from 'react';
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
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const { toast } = useToast();

  // Reset verification attempts when a new image is provided
  useEffect(() => {
    setVerificationAttempts(0);
  }, [capturedImage]);

  const simulateFaceVerification = async () => {
    console.log('Starting face verification... Attempt #', verificationAttempts + 1);
    setIsVerifying(true);
    
    try {
      // Simulate face verification process (1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Increase success rate to 95% for better user experience
      // If previous attempts failed, increase success chance even more
      const successThreshold = verificationAttempts > 0 ? 0.02 : 0.05;
      const isVerified = Math.random() > successThreshold;
      
      console.log('Face verification result:', isVerified);
      
      if (isVerified) {
        toast({
          title: "Face Verified",
          description: `Identity confirmed for ${action === 'checkin' ? 'check-in' : 'check-out'}.`,
        });
        console.log('Calling onSuccess callback');
        onSuccess();
      } else {
        setVerificationAttempts(prev => prev + 1);
        toast({
          title: "Verification Failed",
          description: "Face verification failed. Please try again or ensure better lighting.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Face verification error:", error);
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedAnyway = () => {
    console.log('Proceeding without successful verification');
    toast({
      title: "Manual Verification",
      description: `Proceeding with ${action === 'checkin' ? 'check-in' : 'check-out'} without face verification.`,
    });
    onSuccess();
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
          
          {/* Show "Proceed Anyway" button after failed attempts */}
          {verificationAttempts > 0 && (
            <Button 
              variant="ghost" 
              onClick={handleProceedAnyway} 
              className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              Proceed Without Face Verification
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            Processing face verification... Please wait.
          </p>
        </div>
      )}
      
      {verificationAttempts > 0 && !isVerifying && (
        <div className="bg-amber-50 p-2 rounded text-xs text-amber-700">
          Verification failed {verificationAttempts} {verificationAttempts === 1 ? 'time' : 'times'}. 
          Try improving lighting or camera angle.
        </div>
      )}
    </div>
  );
};

export default PhotoVerification;
