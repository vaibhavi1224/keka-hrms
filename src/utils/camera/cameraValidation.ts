
export const checkCameraSupport = async (): Promise<{
  isSupported: boolean;
  error?: string;
  deviceCount?: number;
}> => {
  console.log('Checking camera support...');
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const error = 'Camera not supported in this browser';
    console.error(error);
    return { isSupported: false, error };
  }

  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    const error = 'Camera requires HTTPS or localhost';
    console.error(error);
    return { isSupported: false, error };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('Video devices found:', videoDevices.length);
    
    if (videoDevices.length === 0) {
      return { isSupported: false, error: 'No camera found on this device' };
    }

    return { isSupported: true, deviceCount: videoDevices.length };
  } catch (error) {
    console.error('Error checking devices:', error);
    return { isSupported: false, error: 'Error checking camera devices' };
  }
};

export const getCameraConstraints = () => ({
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'
  }
});
