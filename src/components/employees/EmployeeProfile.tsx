
import React, { useState } from 'react';
import { X, User, Mail, Phone, Building, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import ProfileUpdateDialog from '@/components/profile/ProfileUpdateDialog';

interface EmployeeProfileProps {
  employee: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EmployeeProfile = ({ employee, onClose, onUpdate }: EmployeeProfileProps) => {
  const [formData, setFormData] = useState({
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    designation: employee.designation || '',
    role: employee.role || 'employee',
    date_of_joining: employee.date_of_joining || '',
    working_hours_start: employee.working_hours_start || '09:00',
    working_hours_end: employee.working_hours_end || '17:00',
    manager_id: employee.manager_id || ''
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'manager')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          role: formData.role,
          date_of_joining: formData.date_of_joining || null,
          working_hours_start: formData.working_hours_start || null,
          working_hours_end: formData.working_hours_end || null,
          manager_id: formData.manager_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employee profile updated successfully');
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to update employee profile');
      console.error('Error updating employee:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployeeMutation.mutate();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Employee Profile
          </CardTitle>
          <div className="flex items-center gap-2">
            <ProfileUpdateDialog targetProfile={employee}>
              <Button variant="outline" size="sm">
                Detailed Profile
              </Button>
            </ProfileUpdateDialog>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            {/* Work Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select value={formData.manager_id} onValueChange={(value) => handleChange('manager_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Manager</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.first_name} {manager.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="joiningDate">Date of Joining</Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.date_of_joining}
                onChange={(e) => handleChange('date_of_joining', e.target.value)}
              />
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Working Hours Start</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.working_hours_start}
                  onChange={(e) => handleChange('working_hours_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Working Hours End</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.working_hours_end}
                  onChange={(e) => handleChange('working_hours_end', e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={updateEmployeeMutation.isPending}
              >
                {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
