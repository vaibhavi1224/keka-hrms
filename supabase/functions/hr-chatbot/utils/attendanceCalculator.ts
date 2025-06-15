
export function calculateAttendanceStats(attendanceRecords: any[]): { presentDays: number; attendanceRate: number; currentMonthAttendance: any[] } {
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthAttendance = attendanceRecords.filter(record => 
    new Date(record.date).getMonth() + 1 === currentMonth
  );
  
  const presentDays = currentMonthAttendance.filter(record => 
    record.status === 'present'
  ).length;
  
  const attendanceRate = currentMonthAttendance.length > 0 
    ? Math.round((presentDays / currentMonthAttendance.length) * 100) 
    : 0;

  return { presentDays, attendanceRate, currentMonthAttendance };
}
