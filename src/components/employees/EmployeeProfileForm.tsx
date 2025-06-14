
import React from 'react';
import { Mail, Building, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeProfileFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    role: string;
    date_of_joining: string;
    working_hours_start: string;
    working_hours_end: string;
    manager_id: string;
  };
  departments: any[];
  managers: any[];
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string) => void;
  onCancel: () => void;
}

const EmployeeProfileForm = ({
  formData,
  departments,
  managers,
  isLoading,
  onSubmit,
  onChange,
  onCancel
}: EmployeeProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.first_name}
            onChange={(e) => onChange('first_name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.last_name}
            onChange={(e) => onChange('last_name', e.target.value)}
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
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>

      {/* Work Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => onChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-department">No Department</SelectItem>
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
            onChange={(e) => onChange('designation', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => onChange('role', value)}>
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
          <Select value={formData.manager_id} onValueChange={(value) => onChange('manager_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-manager">No Manager</SelectItem>
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
          onChange={(e) => onChange('date_of_joining', e.target.value)}
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
            onChange={(e) => onChange('working_hours_start', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endTime">Working Hours End</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.working_hours_end}
            onChange={(e) => onChange('working_hours_end', e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeProfileForm;
