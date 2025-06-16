import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { CameraState } from '@/types/camera';
import { checkCameraSupport } from '@/utils/camera/cameraValidation';
import { startCameraStream, stopCameraStream, connectStreamToVideo } from '@/utils/camera/streamManager';
import { capturePhotoFromVideo } from '@/utils/camera/photoCapture';
import { getCameraErrorMessage, getDebugMessage } from '@/utils/camera/errorHandler';

export const useCameraCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Maximum number of retries
  const MAX_RETRIES = 3;

  // Debug camera capabilities
  useEffect(() => {
    const validateCamera = async () => {
      setDebugInfo('Checking camera support...');
      
      const result = await checkCameraSupport();
      
      if (!result.isSupported) {
        setDebugInfo(result.error || 'Camera validation failed');
        setCameraError(result.error || 'Camera validation failed');
      } else {
        setDebugInfo(`Found ${result.deviceCount} camera(s)`);
      }
    };

    validateCamera();
  }, []);

  // Effect to connect stream to video element when both are available
  useEffect(() => {
    if (stream && videoRef.current && isCapturing) {
      try {
        connectStreamToVideo(stream, videoRef.current);
        setDebugInfo('Camera ready and playing');
      } catch (error) {
        console.error('Error connecting stream to video:', error);
        setDebugInfo('Error connecting stream to video');
      }
    }
  }, [stream, isCapturing]);

  // Cleanup function to ensure camera is stopped when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stopCameraStream(stream);
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    console.log('Start camera function called, current isCapturing:', isCapturing);
    setIsStarting(true);
    
    try {
      setCameraError(null);
      setDebugInfo('Requesting camera access...');
      
      const mediaStream = await startCameraStream();
      
      setDebugInfo('Camera access granted');
      setStream(mediaStream);
      setIsCapturing(true);
      setRetryCount(0); // Reset retry count on successful camera start
      
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      const errorMessage = getCameraErrorMessage(error);
      const debugMessage = getDebugMessage(error);
      
      setCameraError(errorMessage);
      setDebugInfo(debugMessage);
      
      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // If we haven't reached max retries, try again with a different approach
      if (newRetryCount < MAX_RETRIES) {
        toast({
          title: "Camera Error",
          description: `${errorMessage}. Retrying... (${newRetryCount}/${MAX_RETRIES})`,
          variant: "destructive"
        });
        
        // Wait a moment before retrying
        setTimeout(() => {
          startCamera();
        }, 1000);
      } else {
        toast({
          title: "Camera Error",
          description: `${errorMessage}. Please try a different browser or device.`,
          variant: "destructive"
        });
      }
    } finally {
      setIsStarting(false);
    }
  }, [toast, retryCount]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stopCameraStream(stream);
      setStream(null);
      setIsCapturing(false);
      setDebugInfo('Camera stopped');
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    console.log('Capturing photo...');
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      setDebugInfo('Error: Video or canvas not available');
      return;
    }

    try {
      const imageDataUrl = capturePhotoFromVideo(videoRef.current, canvasRef.current);
      setCapturedImage(imageDataUrl);
      stopCamera();
      setDebugInfo('Photo captured successfully');
    } catch (error) {
      console.error('Error capturing photo:', error);
      setDebugInfo('Failed to capture photo');
      
      toast({
        title: "Photo Capture Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    }
  }, [stopCamera, toast]);

  const retakePhoto = () => {
    console.log('Retaking photo...');
    setCapturedImage(null);
    setDebugInfo('Ready to retake photo');
    startCamera();
  };

  // Create a mock/fallback image if camera fails repeatedly
  const createFallbackImage = useCallback(() => {
    console.log('Creating fallback image');
    
    // Create a canvas with a simple avatar/silhouette
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fill background
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a simple avatar
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2 - 30, 50, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw body
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height + 20, 100, Math.PI, Math.PI * 2);
      ctx.fill();
      
      // Add text
      ctx.fillStyle = '#1e40af';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera unavailable - Using fallback', canvas.width/2, canvas.height - 30);
    }
    
    return canvas.toDataURL('image/png');
  }, []);

  // Add debug logging for state changes
  useEffect(() => {
    console.log('State change - isCapturing:', isCapturing, 'capturedImage:', !!capturedImage, 'isStarting:', isStarting);
  }, [isCapturing, capturedImage, isStarting]);

  return {
    isCapturing,
    capturedImage,
    stream,
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
    setCapturedImage,
    createFallbackImage
  };
};
