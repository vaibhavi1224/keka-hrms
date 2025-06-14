
import React from 'react';
import { User, Mail, Briefcase, Calendar, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeFormData } from '@/hooks/useAddEmployee';

interface AddEmployeeFormProps {
  formData: EmployeeFormData;
  showPassword: boolean;
  departments: any[];
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
  onGeneratePassword: () => void;
  onCancel: () => void;
}

const AddEmployeeForm = ({
  formData,
  showPassword,
  departments,
  isLoading,
  onSubmit,
  onChange,
  onTogglePassword,
  onGeneratePassword,
  onCancel
}: AddEmployeeFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Full Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Enter full name"
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Enter password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={onTogglePassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={onGeneratePassword} className="shrink-0">
            Generate
          </Button>
        </div>
      </div>

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
        <Label htmlFor="department" className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Department
        </Label>
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
          placeholder="e.g., Software Developer, Sales Manager"
        />
      </div>

      <div>
        <Label htmlFor="salary">Salary (Optional)</Label>
        <Input
          id="salary"
          type="number"
          value={formData.salary}
          onChange={(e) => onChange('salary', e.target.value)}
          placeholder="Enter annual salary"
        />
      </div>

      <div>
        <Label htmlFor="joiningDate" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date of Joining
        </Label>
        <Input
          id="joiningDate"
          type="date"
          value={formData.date_of_joining}
          onChange={(e) => onChange('date_of_joining', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;
