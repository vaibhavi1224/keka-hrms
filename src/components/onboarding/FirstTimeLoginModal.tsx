
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, FileText, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FirstTimeLoginModalProps {
  open: boolean;
  onComplete: () => void;
}

const FirstTimeLoginModal = ({ open, onComplete }: FirstTimeLoginModalProps) => {
  const { profile, refetch } = useProfile();
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState((profile as any)?.profile_picture || '');
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleProfilePictureUpload = async (file: File) => {
    if (!profile?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfilePicture(data.publicUrl);

      // Update profile with new picture
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully!');
      refetch();
    } catch (error: any) {
      toast.error('Failed to upload profile picture');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    if (!profile?.id) return;

    setUploading(true);
    try {
      // Upload resume file
      const fileName = `${profile.id}/resume-${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store document record
      const { error: docError } = await supabase
        .from('documents')
        .insert({
          employee_id: profile.id,
          document_name: file.name,
          document_type: 'resume',
          file_path: fileName,
          file_size: file.size,
          uploaded_by: profile.id
        });

      if (docError) throw docError;

      setResumeUploaded(true);
      toast.success('Resume uploaded successfully!');
      
      // Parse resume
      await parseResume(file);
      
    } catch (error: any) {
      toast.error('Failed to upload resume');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const parseResume = async (file: File) => {
    if (!profile?.id) return;

    setParsing(true);
    try {
      // Convert file to text (simplified - in production you'd use a proper PDF parser)
      const text = await file.text();
      
      const { data, error } = await supabase.functions.invoke('resume-parser', {
        body: {
          resumeText: text,
          employeeId: profile.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Resume parsed and profile updated!');
        refetch();
      } else {
        throw new Error(data?.error || 'Failed to parse resume');
      }
    } catch (error: any) {
      toast.error('Failed to parse resume');
      console.error('Parse error:', error);
    } finally {
      setParsing(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'resume') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'photo') {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be under 2MB');
        return;
      }
      handleProfilePictureUpload(file);
    } else {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume must be under 10MB');
        return;
      }
      setResumeFile(file);
      handleResumeUpload(file);
    }
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_status: 'completed' })
        .eq('id', profile?.id);

      if (error) throw error;

      toast.success('Welcome to the platform! Your profile has been set up.');
      onComplete();
    } catch (error) {
      toast.error('Failed to complete onboarding');
      console.error('Complete error:', error);
    }
  };

  const getInitials = () => {
    const firstName = (profile as any)?.first_name || '';
    const lastName = (profile as any)?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const canProceed = step === 1 ? true : (step === 2 ? resumeUploaded : true);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Progress value={(step / 3) * 100} className="w-full" />
          
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profilePicture} />
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  
                  <label htmlFor="profile-picture" className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? 'Uploading...' : profilePicture ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </Button>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, 'photo')}
                      disabled={uploading}
                    />
                  </label>
                  
                  <p className="text-sm text-gray-600 text-center">
                    Upload a professional photo that will be visible to your colleagues
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {resumeUploaded ? (
                    <div className="space-y-2">
                      <Check className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-green-600 font-medium">Resume uploaded successfully!</p>
                      {parsing && <p className="text-blue-600">Processing resume...</p>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <label htmlFor="resume-upload" className="cursor-pointer">
                          <Button variant="outline" disabled={uploading} asChild>
                            <span>{uploading ? 'Uploading...' : 'Upload Resume'}</span>
                          </Button>
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleFileInputChange(e, 'resume')}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        Upload your resume (PDF, DOC, or DOCX format, max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What we'll extract:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Personal information (name, contact details)</li>
                    <li>• Education history</li>
                    <li>• Work experience</li>
                    <li>• Skills and projects</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>All Set!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Check className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Profile Setup Complete</h3>
                  <p className="text-gray-600">
                    Your profile photo and resume have been uploaded. HR will review your information and update your profile accordingly.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed || uploading || parsing}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeLoginModal;
