import React from 'react';
import { Fingerprint, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface AttendanceHeaderProps {
  useBiometric: boolean;
  onToggleBiometric: () => void;
  verificationMethod: 'biometric' | 'geolocation';
  onChangeVerificationMethod: (method: 'biometric' | 'geolocation') => void;
}

const AttendanceHeader = ({ 
  useBiometric, 
  onToggleBiometric,
  verificationMethod,
  onChangeVerificationMethod
}: AttendanceHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance and working hours.</p>
        <div className="mt-2 text-sm text-gray-500">
          Office Hours: 09:00 - 17:00 | Monday - Friday
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium text-gray-700 mb-1">Verification Method</div>
        <ToggleGroup type="single" value={verificationMethod} onValueChange={(value) => {
          if (value) onChangeVerificationMethod(value as 'biometric' | 'geolocation');
        }} className="justify-start">
          <ToggleGroupItem value="biometric" aria-label="Select biometric verification" className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            <span>Biometric</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="geolocation" aria-label="Select geolocation verification" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Geolocation</span>
          </ToggleGroupItem>
        </ToggleGroup>
        
        {verificationMethod === 'biometric' && (
          <div className="mt-2 text-xs text-gray-500">
            Using facial recognition to verify your identity
          </div>
        )}
        {verificationMethod === 'geolocation' && (
          <div className="mt-2 text-xs text-gray-500">
            Using your location to verify you're at the office
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHeader;
