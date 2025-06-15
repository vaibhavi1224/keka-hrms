
export function calculateLeaveBalance(leaveRequests: any[]): { usedLeaves: number; leaveBalance: number } {
  const currentYear = new Date().getFullYear();
  const approvedLeaves = leaveRequests.filter(req => 
    req.status === 'approved' && 
    new Date(req.start_date).getFullYear() === currentYear
  );
  
  const usedLeaves = approvedLeaves.reduce((total, req) => total + req.days_requested, 0);
  const totalAnnualLeaves = 24; // Standard annual leave
  const leaveBalance = totalAnnualLeaves - usedLeaves;

  return { usedLeaves, leaveBalance };
}
