
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

const PerformanceAnalytics = () => {
  const { data: performanceData = [], isLoading } = useQuery({
    queryKey: ['performance-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          final_rating,
          employee:profiles!appraisals_employee_id_fkey(first_name, last_name, department),
          review_cycle:review_cycles(name, cycle_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: departmentStats = [] } = useQuery({
    queryKey: ['department-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          final_rating,
          employee:profiles!appraisals_employee_id_fkey(department)
        `);

      if (error) throw error;
      
      const deptData = (data || []).reduce((acc: any, item) => {
        const dept = item.employee?.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = { count: 0, totalRating: 0 };
        }
        acc[dept].count += 1;
        acc[dept].totalRating += parseFloat(item.final_rating || '0');
        return acc;
      }, {});

      return Object.entries(deptData).map(([dept, stats]: [string, any]) => ({
        department: dept,
        averageRating: Math.round((stats.totalRating / stats.count) * 100) / 100,
        employeeCount: stats.count
      }));
    }
  });

  const { data: ratingDistribution = [] } = useQuery({
    queryKey: ['rating-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appraisals')
        .select('final_rating');

      if (error) throw error;
      
      const distribution = (data || []).reduce((acc: any, item) => {
        const rating = Math.floor(parseFloat(item.final_rating || '0'));
        const range = `${rating}-${rating + 0.9}`;
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([range, count]) => ({
        range,
        count: count as number
      }));
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Appraisals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{performanceData.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">
                {performanceData.length > 0 
                  ? Math.round((performanceData.reduce((sum, item) => sum + parseFloat(item.final_rating || '0'), 0) / performanceData.length) * 100) / 100
                  : 0
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {performanceData.filter(item => parseFloat(item.final_rating || '0') >= 4.5).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold">{departmentStats.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentStats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No department data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="averageRating" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {ratingDistribution.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No rating data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
