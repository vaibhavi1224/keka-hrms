
export function calculateSuggestedRating(employeeData: any): number {
  const metrics = employeeData.calculatedMetrics;
  
  // Weighted calculation
  const attendanceWeight = 0.3;
  const performanceWeight = 0.5;
  const consistencyWeight = 0.2;
  
  const attendanceScore = (metrics.attendanceRate / 100) * 5;
  const performanceScore = metrics.avgPerformanceScore;
  const consistencyScore = (metrics.workConsistency / 100) * 5;
  
  const overallRating = (
    attendanceScore * attendanceWeight +
    performanceScore * performanceWeight +
    consistencyScore * consistencyWeight
  );
  
  return Math.min(5, Math.max(1, Math.round(overallRating * 10) / 10));
}
