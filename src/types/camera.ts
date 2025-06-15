
export interface CameraState {
  isCapturing: boolean;
  capturedImage: string | null;
  stream: MediaStream | null;
  cameraError: string | null;
  debugInfo: string;
  isStarting: boolean;
}

export interface CameraConstraints {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    facingMode: string;
  };
}

export interface CameraRefs {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}
