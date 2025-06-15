
import React, { useState, useRef, useCallback } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FaceVerificationProps {
  onSuccess: () => void;
  action: 'checkin' | 'checkout';
}

const FaceVerification = ({ onSuccess, action }: FaceVerificationProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else {
        errorMessage += 'Please check camera permissions and try again.';
      }
      
      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [stopCamera]);

  const simulateFaceVerification = async () => {
    setIsVerifying(true);
    
    // Simulate face verification process (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate 90% success rate for demo purposes
    const isVerified = Math.random() > 0.1;
    
    setIsVerifying(false);
    
    if (isVerified) {
      toast({
        title: "Face Verified",
        description: `Identity confirmed for ${action === 'checkin' ? 'check-in' : 'check-out'}.`,
      });
      onSuccess();
    } else {
      toast({
        title: "Verification Failed",
        description: "Face verification failed. Please try again.",
        variant: "destructive"
      });
      retakePhoto();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const proceedWithoutVerification = () => {
    toast({
      title: "Manual Check-in",
      description: `Proceeding with manual ${action === 'checkin' ? 'check-in' : 'check-out'}.`,
    });
    onSuccess();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-500" />
          Face Verification {action === 'checkin' ? 'Check-In' : 'Check-Out'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameraError ? (
          <div className="text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700">{cameraError}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={startCamera} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Camera Again
              </Button>
              <Button variant="outline" onClick={proceedWithoutVerification} className="w-full">
                Continue Without Face Verification
              </Button>
            </div>
          </div>
        ) : !isCapturing && !capturedImage ? (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Camera className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-700">
                Use face verification for secure attendance tracking. Your face will be captured and verified for identity confirmation.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={startCamera} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Start Face Verification
              </Button>
              <Button variant="outline" onClick={proceedWithoutVerification} className="w-full">
                Skip Face Verification
              </Button>
            </div>
          </div>
        ) : isCapturing ? (
          <div className="text-center space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg bg-gray-100"
              />
              <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-40 border-2 border-blue-500 rounded-lg"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Position your face within the frame and click capture when ready.
            </p>
            <div className="space-y-2">
              <Button onClick={capturePhoto} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={stopCamera} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
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
                <Button variant="outline" onClick={retakePhoto} className="w-full">
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
        ) : null}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default FaceVerification;
