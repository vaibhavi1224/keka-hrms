import React from 'react';
import { Camera, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraControlsProps {
  cameraError: string | null;
  isStarting: boolean;
  onStartCamera: () => void;
  onProceedWithoutVerification: () => void;
  retryCount?: number;
  createFallbackImage?: () => string;
}

const CameraControls = ({
  cameraError,
  isStarting,
  onStartCamera,
  onProceedWithoutVerification,
  retryCount = 0,
  createFallbackImage
}: CameraControlsProps) => {
  const handleStartCameraClick = () => {
    console.log('Start camera button clicked - handler triggered');
    onStartCamera();
  };

  const handleUseFallbackImage = () => {
    if (createFallbackImage) {
      const fallbackImage = createFallbackImage();
      // We need to pass this back up to the parent component
      console.log('Using fallback image');
      onProceedWithoutVerification();
    } else {
      console.log('No fallback image generator available');
      onProceedWithoutVerification();
    }
  };

  if (cameraError) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700">{cameraError}</p>
          {retryCount > 0 && (
            <p className="text-xs text-red-600 mt-2">
              Attempted {retryCount} {retryCount === 1 ? 'time' : 'times'}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Button 
            onClick={handleStartCameraClick} 
            className="w-full"
            disabled={isStarting || retryCount >= 3}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isStarting ? 'Trying...' : 'Try Camera Again'}
          </Button>
          
          {retryCount >= 2 && (
            <Button 
              variant="secondary" 
              onClick={handleUseFallbackImage} 
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Use Alternative Verification
            </Button>
          )}
          
          <Button variant="outline" onClick={onProceedWithoutVerification} className="w-full">
            Continue Without Face Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <Camera className="w-12 h-12 text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-blue-700">
          Use face verification for secure attendance tracking. Your face will be captured and verified for identity confirmation.
        </p>
      </div>
      <div className="space-y-2">
        <Button 
          onClick={handleStartCameraClick} 
          className="w-full"
          disabled={isStarting}
        >
          <Camera className="w-4 h-4 mr-2" />
          {isStarting ? 'Starting Camera...' : 'Start Face Verification'}
        </Button>
        <Button variant="outline" onClick={onProceedWithoutVerification} className="w-full">
          Skip Face Verification
        </Button>
      </div>
    </div>
  );
};

export default CameraControls;
