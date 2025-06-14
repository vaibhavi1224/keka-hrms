
import React, { useState } from 'react';
import { UserPlus, X, Mail, User, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InviteEmployeeProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InviteEmployee = ({ onClose, onSuccess }: InviteEmployeeProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    designation: '',
    salary: '',
    date_of_joining: ''
  });
  const { profile } = useProfile();

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

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: formData.email,
          name: formData.name,
          role: formData.role as 'hr' | 'manager' | 'employee',
          department: formData.department || null,
          designation: formData.designation || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          date_of_joining: formData.date_of_joining || null,
          invited_by: profile?.id,
          status: 'INVITED'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employee invitation sent successfully');
      onSuccess();
      onClose();
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        designation: '',
        salary: '',
        date_of_joining: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to send invitation');
      console.error('Error sending invitation:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    inviteMutation.mutate();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite New Employee
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
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
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

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
              <Label htmlFor="department" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Department
              </Label>
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
                placeholder="e.g., Software Developer, Sales Manager"
              />
            </div>

            <div>
              <Label htmlFor="salary">Salary (Optional)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
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
                onChange={(e) => handleChange('date_of_joining', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteEmployee;
