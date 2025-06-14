
import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: 'hr' | 'manager' | 'employee';
  department: string | null;
  designation: string | null;
  employee_id: string | null;
  is_active: boolean;
}

const EmployeeList = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('first_name');

        if (error) {
          setError(error.message);
        } else {
          setEmployees(data || []);
          
          // Calculate stats
          const total = data?.length || 0;
          const active = data?.filter(emp => emp.is_active).length || 0;
          const inactive = data?.filter(emp => !emp.is_active).length || 0;
          
          setStats({
            total,
            active,
            onLeave: 0, // We'll implement this later with leave data
            inactive
          });
        }
      } catch (err) {
        setError('Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Check if user has permission to view all employees
  const canViewAllEmployees = profile?.role === 'hr' || profile?.role === 'manager';

  if (!canViewAllEmployees) {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to view all employees. Contact your HR administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information.</p>
        </div>
        {profile?.role === 'hr' && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Employees', count: stats.total, color: 'bg-blue-50 text-blue-600' },
          { title: 'Active', count: stats.active, color: 'bg-green-50 text-green-600' },
          { title: 'On Leave', count: stats.onLeave, color: 'bg-yellow-50 text-yellow-600' },
          { title: 'Inactive', count: stats.inactive, color: 'bg-red-50 text-red-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No employees found.</p>
            ) : (
              employees.map((employee) => {
                const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unnamed Employee';
                const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase() || 'UN';
                
                return (
                  <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{initials}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fullName}</h3>
                        <p className="text-sm text-gray-500">
                          {employee.designation || 'No designation'} • {employee.department || 'No department'}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">Role: {employee.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{employee.email}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {profile?.role === 'hr' && (
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeList;
