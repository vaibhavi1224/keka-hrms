
import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';

interface ResumeUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResumeUploadDialog = ({ open, onOpenChange }: ResumeUploadDialogProps) => {
  const { profile } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/resume.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setUploadedFile(file.name);
      
      // Process the resume
      await processResume(file, data.publicUrl);
      
      toast.success('Resume uploaded and sent for processing!');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const processResume = async (file: File, fileUrl: string) => {
    if (!profile?.id) return;

    setProcessing(true);
    try {
      // Convert file to text for processing
      const formData = new FormData();
      formData.append('file', file);

      // Read file as text (simplified - in real implementation you'd use proper PDF parsing)
      const text = await file.text().catch(() => '');
      
      // Call the resume parser edge function
      const { error } = await supabase.functions.invoke('resume-parser', {
        body: {
          resumeText: text,
          employeeId: profile.id,
          fileUrl: fileUrl
        }
      });

      if (error) throw error;

      toast.success('Resume processed successfully! HR will review the extracted information.');
      
    } catch (error: any) {
      console.error('Processing error:', error);
      toast.error('Resume uploaded but processing failed. HR can still review manually.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      const fakeEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('resume-upload')?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {uploading ? 'Uploading...' : 'Drag and drop your resume here, or click to select'}
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, DOC, DOCX files up to 5MB
                </p>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || processing}
                />
              </div>

              {uploadedFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">{uploadedFile}</span>
                  {processing && <span className="text-xs text-green-600">Processing...</span>}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeUploadDialog;
