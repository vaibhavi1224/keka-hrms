
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    const checkCameraSupport = async () => {
      console.log('Checking camera support...');
      setDebugInfo('Checking camera support...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = 'Camera not supported in this browser';
        console.error(error);
        setDebugInfo(error);
        setCameraError(error);
        return;
      }

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        const error = 'Camera requires HTTPS or localhost';
        console.error(error);
        setDebugInfo(error);
        setCameraError(error);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Video devices found:', videoDevices.length);
        setDebugInfo(`Found ${videoDevices.length} camera(s)`);
        
        if (videoDevices.length === 0) {
          setCameraError('No camera found on this device');
        }
      } catch (error) {
        console.error('Error checking devices:', error);
        setDebugInfo('Error checking camera devices');
      }
    };

    checkCameraSupport();
  }, []);

  const startCamera = useCallback(async () => {
    console.log('Start camera button clicked');
    setIsStarting(true);
    
    try {
      console.log('Starting camera...');
      setCameraError(null);
      setDebugInfo('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Camera stream obtained');
      setDebugInfo('Camera access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setDebugInfo('Camera ready');
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
        setDebugInfo('Camera permission denied');
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
        setDebugInfo('No camera device found');
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
        setDebugInfo('Camera not supported');
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
        setDebugInfo('Camera busy');
      } else {
        errorMessage += 'Please check camera permissions and try again.';
        setDebugInfo(`Camera error: ${error.message}`);
      }
      
      setCameraError(errorMessage);
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
    console.log('Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
    setIsCapturing(false);
    setDebugInfo('Camera stopped');
  }, [stream]);

  const capturePhoto = useCallback(() => {
    console.log('Capturing photo...');
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Could not get canvas context');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
    setDebugInfo('Photo captured successfully');
    console.log('Photo captured');
  }, [stopCamera]);

  const retakePhoto = () => {
    console.log('Retaking photo...');
    setCapturedImage(null);
    setDebugInfo('Ready to retake photo');
    startCamera();
  };

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
