
export const capturePhotoFromVideo = (
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): string => {
  console.log('Capturing photo...');
  
  const context = canvasElement.getContext('2d');
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  console.log(`Canvas dimensions: ${canvasElement.width}x${canvasElement.height}`);

  context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  const imageDataUrl = canvasElement.toDataURL('image/jpeg', 0.8);
  console.log('Photo captured');
  
  return imageDataUrl;
};
