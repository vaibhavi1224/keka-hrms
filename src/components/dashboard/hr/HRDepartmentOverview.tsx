
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HRDepartmentOverview = () => {
  // Fetch real department data
  const { data: departmentData = [] } = useQuery({
    queryKey: ['department-overview'],
    queryFn: async () => {
      // Get departments with employee counts
      const { data: departments } = await supabase
        .from('departments')
        .select('*');

      if (!departments) return [];

      // Get employee counts per department
      const departmentStats = await Promise.all(
        departments.map(async (dept) => {
          const { data: employees } = await supabase
            .from('profiles')
            .select('id')
            .eq('department', dept.name)
            .eq('is_active', true);

          // Get attendance data for this department (current month)
          const today = new Date();
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();

          const { data: attendanceRecords } = await supabase
            .from('attendance')
            .select('user_id, status')
            .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lt('date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
            .in('user_id', employees?.map(emp => emp.id) || []);

          const totalRecords = attendanceRecords?.length || 0;
          const presentRecords = attendanceRecords?.filter(record => 
            record.status === 'present'
          ).length || 0;

          const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 95;

          return {
            dept: dept.name,
            employees: employees?.length || 0,
            attendance: `${Math.round(attendanceRate)}%`,
            color: getDepartmentColor(dept.name)
          };
        })
      );

      return departmentStats.filter(dept => dept.employees > 0);
    }
  });

  const getDepartmentColor = (deptName: string) => {
    const colors = {
      'Engineering': 'bg-blue-500',
      'Sales': 'bg-green-500',
      'Marketing': 'bg-purple-500',
      'Human Resources': 'bg-orange-500',
      'Finance': 'bg-red-500',
      'Operations': 'bg-teal-500'
    };
    return colors[deptName as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departmentData.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${dept.color}`} />
                <div>
                  <p className="font-medium text-gray-900">{dept.dept}</p>
                  <p className="text-sm text-gray-600">{dept.employees} employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{dept.attendance}</p>
                <p className="text-sm text-gray-600">attendance</p>
              </div>
            </div>
          ))}
          
          {departmentData.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No department data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HRDepartmentOverview;
