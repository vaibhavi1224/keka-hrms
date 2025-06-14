
import React, { useState } from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AttendanceTracker = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString());
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance and working hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  onClick={handleCheckIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  Check In
                </Button>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-green-600 font-medium">
                    Checked in at {checkInTime}
                  </div>
                  <Button 
                    onClick={handleCheckOut}
                    variant="destructive"
                    className="px-8 py-3 text-lg"
                  >
                    Check Out
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">8:00</div>
                <div className="text-sm text-gray-500">Working Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">7:45</div>
                <div className="text-sm text-gray-500">Hours Worked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0:15</div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Current Location</div>
                <div className="font-medium">Office - Floor 3</div>
                <div className="text-xs text-gray-500">Verified via GPS</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{day}</span>
                    <span className={`text-sm ${index < 3 ? 'text-green-600' : 'text-gray-400'}`}>
                      {index < 3 ? '8:00' : index === 3 ? '7:45' : '--'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
