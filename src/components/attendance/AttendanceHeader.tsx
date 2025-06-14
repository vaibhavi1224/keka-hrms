
import React from 'react';
import { Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendanceHeaderProps {
  useBiometric: boolean;
  onToggleBiometric: () => void;
}

const AttendanceHeader = ({ useBiometric, onToggleBiometric }: AttendanceHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance and working hours.</p>
        <div className="mt-2 text-sm text-gray-500">
          Office Hours: 09:00 - 17:00 | Monday - Friday
        </div>
      </div>
      <Button
        variant={useBiometric ? "default" : "outline"}
        onClick={onToggleBiometric}
        className="flex items-center gap-2"
      >
        <Fingerprint className="w-4 h-4" />
        Biometric {useBiometric ? 'ON' : 'OFF'}
      </Button>
    </div>
  );
};

export default AttendanceHeader;
