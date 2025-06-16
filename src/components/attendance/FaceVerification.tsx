import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCameraCapture } from '@/hooks/useCameraCapture';
import CameraControls from './CameraControls';
import CameraView from './CameraView';
import PhotoVerification from './PhotoVerification';

interface FaceVerificationProps {
  onSuccess: () => void;
  action: 'checkin' | 'checkout';
}

const FaceVerification = ({ onSuccess, action }: FaceVerificationProps) => {
  const { toast } = useToast();
  const [manualVerificationAttempted, setManualVerificationAttempted] = useState(false);
  const {
    isCapturing,
    capturedImage,
    cameraError,
    debugInfo,
    isStarting,
    retryCount,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    createFallbackImage,
    setCapturedImage
  } = useCameraCapture();

  console.log('FaceVerification render - isCapturing:', isCapturing, 'capturedImage:', !!capturedImage, 'isStarting:', isStarting);

  const proceedWithoutVerification = () => {
    console.log('Proceeding without verification');
    setManualVerificationAttempted(true);
    toast({
      title: "Manual Check-in",
      description: `Proceeding with manual ${action === 'checkin' ? 'check-in' : 'check-out'}.`,
    });
    onSuccess();
  };

  const handleFallbackVerification = () => {
    console.log('Using fallback verification');
    // Create a fallback image and proceed
    if (createFallbackImage) {
      const fallbackImg = createFallbackImage();
      setCapturedImage(fallbackImg);
    } else {
      proceedWithoutVerification();
    }
  };

  const renderContent = () => {
    console.log('Rendering content - isCapturing:', isCapturing, 'capturedImage:', !!capturedImage);
    
    if (capturedImage) {
      console.log('Rendering PhotoVerification');
      return (
        <PhotoVerification
          capturedImage={capturedImage}
          action={action}
          onSuccess={onSuccess}
          onRetakePhoto={retakePhoto}
        />
      );
    }

    if (isCapturing) {
      console.log('Rendering CameraView');
      return (
        <CameraView
          videoRef={videoRef}
          onCapturePhoto={capturePhoto}
          onStopCamera={stopCamera}
        />
      );
    }

    console.log('Rendering CameraControls');
    return (
      <CameraControls
        cameraError={cameraError}
        isStarting={isStarting}
        retryCount={retryCount}
        onStartCamera={startCamera}
        onProceedWithoutVerification={proceedWithoutVerification}
        createFallbackImage={createFallbackImage}
      />
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-500" />
          Face Verification {action === 'checkin' ? 'Check-In' : 'Check-Out'}
        </CardTitle>
        {debugInfo && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Debug: {debugInfo}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default FaceVerification;
