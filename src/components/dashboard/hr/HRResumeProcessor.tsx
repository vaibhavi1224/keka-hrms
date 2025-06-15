
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';

const HRResumeProcessor = () => {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: pendingResumes = [], isLoading } = useQuery({
    queryKey: ['pending-resumes'],
    queryFn: async () => {
      // Get resumes that need processing (files uploaded but not yet processed)
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          *,
          profiles!documents_employee_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('document_type', 'resume')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out resumes that have already been processed
      const { data: processedResumes } = await supabase
        .from('resume_data')
        .select('employee_id');

      const processedIds = new Set(processedResumes?.map(r => r.employee_id) || []);
      
      return documents?.filter(doc => !processedIds.has(doc.employee_id)) || [];
    }
  });

  const processResumeMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const resume = pendingResumes.find(r => r.id === resumeId);
      if (!resume) throw new Error('Resume not found');

      // In a real implementation, you would:
      // 1. Download the file from storage
      // 2. Extract text using PDF parsing libraries
      // 3. Send to AI for processing
      
      // For now, we'll simulate with the resume parser edge function
      const { data, error } = await supabase.functions.invoke('resume-parser', {
        body: {
          resumeText: `Sample resume text for ${resume.profiles?.first_name} ${resume.profiles?.last_name}`,
          employeeId: resume.employee_id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-resumes'] });
      queryClient.invalidateQueries({ queryKey: ['resume-data'] });
      toast.success('Resume processed successfully!');
      setProcessingId(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to process resume: ${error.message}`);
      setProcessingId(null);
    }
  });

  const handleProcessResume = (resumeId: string) => {
    setProcessingId(resumeId);
    processResumeMutation.mutate(resumeId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          Resume Processing Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingResumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Resumes</h3>
            <p className="text-gray-600">All uploaded resumes have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {pendingResumes.length} resume(s) waiting for AI processing
              </p>
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pending Processing
              </Badge>
            </div>

            {pendingResumes.map((resume) => (
              <div key={resume.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">
                      {resume.profiles?.first_name} {resume.profiles?.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">{resume.profiles?.email}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleProcessResume(resume.id)}
                  disabled={processingId === resume.id}
                  className="flex items-center gap-2"
                >
                  {processingId === resume.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Process with AI
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HRResumeProcessor;
