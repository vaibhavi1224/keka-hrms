
import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapturePhoto: () => void;
  onStopCamera: () => void;
}

const CameraView = ({ videoRef, onCapturePhoto, onStopCamera }: CameraViewProps) => {
  return (
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
        <Button onClick={onCapturePhoto} className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Capture Photo
        </Button>
        <Button variant="outline" onClick={onStopCamera} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
