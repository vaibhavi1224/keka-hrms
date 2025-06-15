
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Upload } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

// Define schemas based on user role
const hrProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  date_of_joining: z.string().optional(),
  working_hours_start: z.string().optional(),
  working_hours_end: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  address: z.string().optional(),
});

const employeeProfileSchema = z.object({
  phone: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  address: z.string().optional(),
});

type HRProfileFormData = z.infer<typeof hrProfileSchema>;
type EmployeeProfileFormData = z.infer<typeof employeeProfileSchema>;

interface ProfileUpdateDialogProps {
  children: React.ReactNode;
  targetProfile?: any; // For HR editing other users
}

const ProfileUpdateDialog = ({ children, targetProfile }: ProfileUpdateDialogProps) => {
  const { profile, refetch } = useProfile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Determine if this is HR editing another user or user editing themselves
  const isHR = profile?.role === 'hr';
  const editingOtherUser = targetProfile && targetProfile.id !== profile?.id;
  const currentProfile = targetProfile || profile;
  
  const [profilePicture, setProfilePicture] = useState(currentProfile?.profile_picture || '');
  const [employeeData, setEmployeeData] = useState({
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: ''
  });

  // Use appropriate schema based on user role and editing context
  const schema = isHR ? hrProfileSchema : employeeProfileSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isHR ? {
      first_name: currentProfile?.first_name || '',
      last_name: currentProfile?.last_name || '',
      phone: currentProfile?.phone || '',
      department: currentProfile?.department || '',
      designation: currentProfile?.designation || '',
      date_of_joining: currentProfile?.date_of_joining || '',
      working_hours_start: currentProfile?.working_hours_start || '',
      working_hours_end: currentProfile?.working_hours_end || '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
    } : {
      phone: currentProfile?.phone || '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
    },
  });

  React.useEffect(() => {
    if (currentProfile && open) {
      if (isHR) {
        form.reset({
          first_name: currentProfile.first_name || '',
          last_name: currentProfile.last_name || '',
          phone: currentProfile.phone || '',
          department: currentProfile.department || '',
          designation: currentProfile.designation || '',
          date_of_joining: currentProfile.date_of_joining || '',
          working_hours_start: currentProfile.working_hours_start || '',
          working_hours_end: currentProfile.working_hours_end || '',
          emergency_contact_name: employeeData.emergency_contact_name,
          emergency_contact_phone: employeeData.emergency_contact_phone,
          address: employeeData.address,
        });
      } else {
        form.reset({
          phone: currentProfile.phone || '',
          emergency_contact_name: employeeData.emergency_contact_name,
          emergency_contact_phone: employeeData.emergency_contact_phone,
          address: employeeData.address,
        });
      }
      setProfilePicture(currentProfile.profile_picture || '');
      
      // Fetch employee data if exists
      fetchEmployeeData();
    }
  }, [currentProfile, open, form, isHR]);

  const fetchEmployeeData = async () => {
    if (!currentProfile?.id) return;

    try {
      const { data } = await supabase
        .from('employees')
        .select('emergency_contact_name, emergency_contact_phone, address')
        .eq('profile_id', currentProfile.id)
        .single();

      if (data) {
        setEmployeeData({
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!currentProfile?.id) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentProfile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 2MB',
        variant: 'destructive',
      });
      return;
    }

    const publicUrl = await uploadProfilePicture(file);
    if (publicUrl) {
      setProfilePicture(publicUrl);
    }
  };

  const onSubmit = async (data: any) => {
    if (!currentProfile?.id) return;

    try {
      // Update profile data
      const profileUpdates: any = {
        profile_picture: profilePicture,
      };

      if (isHR) {
        // HR can update all profile fields
        profileUpdates.first_name = data.first_name;
        profileUpdates.last_name = data.last_name;
        profileUpdates.phone = data.phone;
        profileUpdates.department = data.department;
        profileUpdates.designation = data.designation;
        profileUpdates.date_of_joining = data.date_of_joining || null;
        profileUpdates.working_hours_start = data.working_hours_start || null;
        profileUpdates.working_hours_end = data.working_hours_end || null;
      } else {
        // Employee can only update phone
        profileUpdates.phone = data.phone;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', currentProfile.id);

      if (profileError) throw profileError;

      // Handle employee data separately - check if record exists first
      if (data.emergency_contact_name || data.emergency_contact_phone || data.address) {
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('profile_id', currentProfile.id)
          .single();

        const employeeUpdates = {
          profile_id: currentProfile.id,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          address: data.address || null,
        };

        if (existingEmployee) {
          // Update existing record
          const { error: employeeError } = await supabase
            .from('employees')
            .update(employeeUpdates)
            .eq('profile_id', currentProfile.id);

          if (employeeError) throw employeeError;
        } else {
          // Insert new record
          const { error: employeeError } = await supabase
            .from('employees')
            .insert(employeeUpdates);

          if (employeeError) throw employeeError;
        }
      }

      toast({
        title: 'Profile updated',
        description: 'Profile has been updated successfully',
      });

      refetch();
      setOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const getInitials = () => {
    const firstName = currentProfile?.first_name || '';
    const lastName = currentProfile?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const canEditProfilePicture = !editingOtherUser || isHR;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOtherUser ? `Edit ${currentProfile?.first_name}'s Profile` : 'Update Profile'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profilePicture} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                {canEditProfilePicture && (
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              {uploading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Upload className="w-4 h-4 animate-pulse" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* HR-only fields */}
            {isHR && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date_of_joining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Joining</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="working_hours_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Hours Start</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="working_hours_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Hours End</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Fields both HR and employees can edit */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personal information fields for employees */}
            <FormField
              control={form.control}
              name="emergency_contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Optional" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Read-only fields for employees */}
            {!isHR && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900">View Only Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <Input value={currentProfile?.first_name || ''} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input value={currentProfile?.last_name || ''} disabled className="bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input value={currentProfile?.email || ''} disabled className="bg-gray-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <Input value={currentProfile?.department || 'Not assigned'} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Designation</label>
                    <Input value={currentProfile?.designation || 'Not assigned'} disabled className="bg-gray-50" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateDialog;
