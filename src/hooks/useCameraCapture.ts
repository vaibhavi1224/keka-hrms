
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

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
      connectStreamToVideo(stream, videoRef.current);
      setDebugInfo('Camera ready and playing');
    }
  }, [stream, isCapturing]);

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
      
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      const errorMessage = getCameraErrorMessage(error);
      const debugMessage = getDebugMessage(error);
      
      setCameraError(errorMessage);
      setDebugInfo(debugMessage);
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    stopCameraStream(stream);
    setStream(null);
    setIsCapturing(false);
    setDebugInfo('Camera stopped');
  }, [stream]);

  const capturePhoto = useCallback(() => {
    console.log('Capturing photo...');
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
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
    }
  }, [stopCamera]);

  const retakePhoto = () => {
    console.log('Retaking photo...');
    setCapturedImage(null);
    setDebugInfo('Ready to retake photo');
    startCamera();
  };

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
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    setCapturedImage
  };
};
