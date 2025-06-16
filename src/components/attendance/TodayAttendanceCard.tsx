import React from 'react';
import { Clock, Camera, MapPin, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TodayAttendanceCardProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  loading: boolean;
  useBiometric: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  verificationMethod: 'biometric' | 'geolocation';
}

const TodayAttendanceCard = ({
  isCheckedIn,
  checkInTime,
  checkOutTime,
  loading,
  useBiometric,
  onCheckIn,
  onCheckOut,
  verificationMethod
}: TodayAttendanceCardProps) => {
  const calculateWorkedHours = () => {
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(`1970-01-01T${checkInTime}`);
      const checkOut = new Date(`1970-01-01T${checkOutTime}`);
      const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      return Math.max(0, Math.min(diff, 8)).toFixed(1);
    }
    return '0.0';
  };

  const getRemainingHours = () => {
    const worked = parseFloat(calculateWorkedHours());
    return Math.max(0, 8 - worked).toFixed(1);
  };

  const renderVerificationIcon = () => {
    if (verificationMethod === 'biometric') {
      return <Fingerprint className="w-4 h-4" />;
    } else {
      return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Today's Attendance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-2xl font-semibold text-blue-600">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          {!isCheckedIn ? (
            <Button 
              onClick={onCheckIn}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg flex items-center gap-2"
            >
              {renderVerificationIcon()}
              {loading ? 'Checking In...' : 'Check In'}
            </Button>
          ) : (
            <div className="space-y-4 text-center">
              <div className="text-green-600 font-medium flex items-center justify-center gap-1">
                {renderVerificationIcon()}
                <span>Checked in at {checkInTime}</span>
              </div>
              <Button 
                onClick={onCheckOut}
                disabled={loading}
                variant="destructive"
                className="px-8 py-3 text-lg flex items-center gap-2"
              >
                {renderVerificationIcon()}
                {loading ? 'Checking Out...' : 'Check Out'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">8:00</div>
            <div className="text-sm text-gray-500">Expected Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{calculateWorkedHours()}</div>
            <div className="text-sm text-gray-500">Hours Worked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getRemainingHours()}</div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
        </div>

        {checkInTime && checkOutTime && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Today's Summary</div>
            <div className="text-xs text-gray-600 mt-1">
              Check In: {checkInTime} | Check Out: {checkOutTime}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Verification Method: {verificationMethod === 'biometric' ? 'Biometric' : 'Geolocation'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAttendanceCard;
