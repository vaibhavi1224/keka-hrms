
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyAttendanceCardProps {
  weeklyAttendance: any[];
}

const WeeklyAttendanceCard = ({ weeklyAttendance }: WeeklyAttendanceCardProps) => {
  const calculateWorkedHours = () => {
    // This is a simplified version - in real implementation you'd calculate from check in/out times
    return '8.0';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>This Week</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
            const attendance = weeklyAttendance[index];
            const status = attendance ? 'Present' : index < new Date().getDay() ? 'Absent' : '--';
            const hours = attendance && attendance.check_in_time && attendance.check_out_time 
              ? calculateWorkedHours() 
              : index < new Date().getDay() ? '0:00' : '--';
            
            return (
              <div key={day} className="flex justify-between items-center">
                <span className="text-sm font-medium">{day}</span>
                <div className="text-right">
                  <div className={`text-sm ${
                    status === 'Present' ? 'text-green-600' : 
                    status === 'Absent' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {hours}
                  </div>
                  <div className="text-xs text-gray-500">{status}</div>
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500">
              Weekend: Saturday - Sunday (Holiday)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyAttendanceCard;
