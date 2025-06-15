
export const getCameraErrorMessage = (error: any): string => {
  let errorMessage = 'Unable to access camera. ';
  
  if (error.name === 'NotAllowedError') {
    errorMessage += 'Please allow camera access and try again.';
  } else if (error.name === 'NotFoundError') {
    errorMessage += 'No camera found on this device.';
  } else if (error.name === 'NotSupportedError') {
    errorMessage += 'Camera not supported in this browser.';
  } else if (error.name === 'NotReadableError') {
    errorMessage += 'Camera is already in use by another application.';
  } else {
    errorMessage += 'Please check camera permissions and try again.';
  }
  
  return errorMessage;
};

export const getDebugMessage = (error: any): string => {
  if (error.name === 'NotAllowedError') {
    return 'Camera permission denied';
  } else if (error.name === 'NotFoundError') {
    return 'No camera device found';
  } else if (error.name === 'NotSupportedError') {
    return 'Camera not supported';
  } else if (error.name === 'NotReadableError') {
    return 'Camera busy';
  } else {
    return `Camera error: ${error.message}`;
  }
};
