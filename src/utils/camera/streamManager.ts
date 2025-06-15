
export const startCameraStream = async (): Promise<MediaStream> => {
  console.log('Starting camera...');
  
  const constraints = {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user'
    }
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  console.log('Camera stream obtained');
  return mediaStream;
};

export const stopCameraStream = (stream: MediaStream | null): void => {
  console.log('Stopping camera...');
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Camera track stopped');
    });
  }
};

export const connectStreamToVideo = (
  stream: MediaStream,
  videoElement: HTMLVideoElement
): void => {
  console.log('Connecting stream to video element');
  videoElement.srcObject = stream;
  
  videoElement.onloadedmetadata = () => {
    console.log('Video metadata loaded, video should be playing');
  };
  
  // Ensure video plays
  videoElement.play().catch(error => {
    console.error('Error playing video:', error);
  });
};
