
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import AddEmployee from '@/components/hr/AddEmployee';
import EmployeeProfile from './EmployeeProfile';
import OffboardEmployee from './OffboardEmployee';
import EmployeeStats from './EmployeeStats';
import EmployeeSearch from './EmployeeSearch';
import EmployeeCard from './EmployeeCard';
import EmployeeListHeader from './EmployeeListHeader';

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const { profile } = useProfile();

  const { data: employees = [], refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          manager:profiles!profiles_manager_id_fkey(first_name, last_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      console.log('Employees fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!profile
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  const filteredEmployees = employees.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSuccess = () => {
    refetch();
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const handleOffboardEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowOffboardModal(true);
  };

  const isHR = profile?.role === 'hr';
  const hrCount = employees.filter(e => e.role === 'hr').length;
  const managerCount = employees.filter(e => e.role === 'manager').length;

  return (
    <div className="space-y-6">
      <EmployeeListHeader 
        isHR={isHR}
        onAddEmployee={() => setShowAddModal(true)}
      />

      <EmployeeStats
        totalEmployees={employees.length}
        totalDepartments={departments.length}
        hrCount={hrCount}
        managerCount={managerCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                isHR={isHR}
                onEdit={handleEditEmployee}
                onOffboard={handleOffboardEmployee}
              />
            ))}
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No employees found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showAddModal && (
        <AddEmployee
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      
      {showProfileModal && selectedEmployee && (
        <EmployeeProfile
          employee={selectedEmployee}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedEmployee(null);
          }}
          onUpdate={() => {
            refetch();
            setShowProfileModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showOffboardModal && selectedEmployee && (
        <OffboardEmployee
          employee={selectedEmployee}
          onClose={() => {
            setShowOffboardModal(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            refetch();
            setShowOffboardModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;
