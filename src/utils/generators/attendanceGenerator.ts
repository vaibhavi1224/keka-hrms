
import { AttendanceRecord } from '@/types/performanceData';

export function generateAttendanceRecords(employeeId: string, startDate: Date, endDate: Date): AttendanceRecord[] {
  const attendance: AttendanceRecord[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const attendanceRate = 0.85 + Math.random() * 0.15; // 85-100% attendance
      
      if (Math.random() < attendanceRate) {
        const checkInHour = 8 + Math.random() * 2; // 8-10 AM
        const checkInMinute = Math.floor(Math.random() * 60);
        const workingHours = 7.5 + Math.random() * 2; // 7.5-9.5 hours
        
        const checkInTime = new Date(currentDate);
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
        
        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(checkOutTime.getHours() + Math.floor(workingHours));
        checkOutTime.setMinutes(checkOutTime.getMinutes() + Math.floor((workingHours % 1) * 60));
        
        attendance.push({
          user_id: employeeId,
          date: currentDate.toISOString().split('T')[0],
          check_in_time: checkInTime.toISOString(),
          check_out_time: checkOutTime.toISOString(),
          status: 'present' as const,
          working_hours: Math.round(workingHours * 100) / 100,
          biometric_verified: Math.random() > 0.1,
          biometric_verified_out: Math.random() > 0.1
        });
      } else {
        // Absent or late - use null for timestamps
        const statusOptions: ('absent' | 'late')[] = ['absent', 'late'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        attendance.push({
          user_id: employeeId,
          date: currentDate.toISOString().split('T')[0],
          check_in_time: null,
          check_out_time: null,
          status: status,
          working_hours: 0,
          biometric_verified: false,
          biometric_verified_out: false
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return attendance;
}
