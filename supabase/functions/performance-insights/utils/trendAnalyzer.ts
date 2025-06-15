
interface PerformanceMetric {
  metric_type: string;
  metric_value: number;
  target_value?: number;
  measurement_date: string;
  quarter: number;
  year: number;
}

interface AttendanceRecord {
  date: string;
  status: string;
  working_hours?: number;
}

interface TrendAnalysis {
  attendanceRate: {
    current: number;
    previous: number;
    trend: 'improving' | 'declining' | 'stable';
    change: number;
  };
  performanceMetrics: {
    [key: string]: {
      current: number;
      previous: number;
      trend: 'improving' | 'declining' | 'stable';
      change: number;
    };
  };
  consistency: {
    score: number;
    description: string;
  };
}

export function analyzePerformanceTrends(metrics: PerformanceMetric[], attendance: AttendanceRecord[]): TrendAnalysis {
  // Calculate attendance trends
  const attendanceAnalysis = calculateAttendanceTrends(attendance);
  
  // Calculate performance metric trends
  const metricAnalysis = calculateMetricTrends(metrics);
  
  // Calculate consistency score
  const consistency = calculateConsistencyScore(metrics, attendance);

  return {
    attendanceRate: attendanceAnalysis,
    performanceMetrics: metricAnalysis,
    consistency
  };
}

function calculateAttendanceTrends(attendance: AttendanceRecord[]) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const currentMonthAttendance = attendance.filter(record => 
    new Date(record.date) >= lastMonth
  );
  
  const previousMonthAttendance = attendance.filter(record => {
    const date = new Date(record.date);
    return date >= twoMonthsAgo && date < lastMonth;
  });

  const currentRate = calculateAttendanceRate(currentMonthAttendance);
  const previousRate = calculateAttendanceRate(previousMonthAttendance);
  const change = currentRate - previousRate;

  return {
    current: currentRate,
    previous: previousRate,
    trend: Math.abs(change) < 2 ? 'stable' : (change > 0 ? 'improving' : 'declining'),
    change
  };
}

function calculateAttendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const presentDays = records.filter(r => r.status === 'present').length;
  return Math.round((presentDays / records.length) * 100);
}

function calculateMetricTrends(metrics: PerformanceMetric[]) {
  const metricGroups: { [key: string]: PerformanceMetric[] } = {};
  
  // Group metrics by type
  metrics.forEach(metric => {
    if (!metricGroups[metric.metric_type]) {
      metricGroups[metric.metric_type] = [];
    }
    metricGroups[metric.metric_type].push(metric);
  });

  const analysis: { [key: string]: any } = {};

  Object.entries(metricGroups).forEach(([type, typeMetrics]) => {
    const sorted = typeMetrics.sort((a, b) => 
      new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );

    if (sorted.length >= 2) {
      const current = sorted[sorted.length - 1].metric_value;
      const previous = sorted[sorted.length - 2].metric_value;
      const change = ((current - previous) / previous) * 100;

      analysis[type] = {
        current,
        previous,
        trend: Math.abs(change) < 5 ? 'stable' : (change > 0 ? 'improving' : 'declining'),
        change: Math.round(change)
      };
    }
  });

  return analysis;
}

function calculateConsistencyScore(metrics: PerformanceMetric[], attendance: AttendanceRecord[]): { score: number; description: string } {
  let consistencyFactors = 0;
  let totalFactors = 0;

  // Attendance consistency
  if (attendance.length > 0) {
    const attendanceRate = calculateAttendanceRate(attendance);
    if (attendanceRate >= 90) consistencyFactors++;
    totalFactors++;
  }

  // Performance metrics consistency
  const metricTypes = [...new Set(metrics.map(m => m.metric_type))];
  metricTypes.forEach(type => {
    const typeMetrics = metrics.filter(m => m.metric_type === type);
    if (typeMetrics.length >= 3) {
      const values = typeMetrics.map(m => m.metric_value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
      const coefficientOfVariation = Math.sqrt(variance) / avg;
      
      if (coefficientOfVariation < 0.2) consistencyFactors++; // Low variation indicates consistency
      totalFactors++;
    }
  });

  const score = totalFactors > 0 ? Math.round((consistencyFactors / totalFactors) * 100) : 0;
  
  let description = 'No data available';
  if (score >= 80) description = 'Highly consistent performance';
  else if (score >= 60) description = 'Good consistency with room for improvement';
  else if (score >= 40) description = 'Moderate consistency, focus needed';
  else if (score > 0) description = 'Low consistency, requires attention';

  return { score, description };
}
