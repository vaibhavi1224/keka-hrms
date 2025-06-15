
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, User, Briefcase, GraduationCap, Code, CheckCircle } from 'lucide-react';

interface ResumeData {
  id: string;
  employee_id: string;
  extracted_data: {
    personal_info?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      address?: string;
      email?: string;
    };
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
      field_of_study: string;
    }>;
    work_experience?: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    skills?: string[];
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
  };
  processed_at: string;
  status: string;
  employee_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const ResumeDataViewer = () => {
  const queryClient = useQueryClient();

  const { data: resumeData = [], isLoading } = useQuery({
    queryKey: ['resume-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resume_data')
        .select('*')
        .order('processed_at', { ascending: false });

      if (error) {
        console.error('Error fetching resume data:', error);
        throw error;
      }

      // Fetch employee profiles separately
      const resumeDataWithProfiles = await Promise.all(
        (data || []).map(async (resume) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', resume.employee_id)
            .single();

          return {
            ...resume,
            employee_profile: profile
          } as ResumeData;
        })
      );

      return resumeDataWithProfiles;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ employeeId, resumeId }: { employeeId: string, resumeId: string }) => {
      const { error } = await supabase
        .from('resume_data')
        .update({ status: 'reviewed' })
        .eq('id', resumeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume-data'] });
      toast.success('Resume data marked as reviewed');
    },
    onError: () => {
      toast.error('Failed to update resume status');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Data Review</h1>
          <p className="text-gray-600">Review and approve extracted resume information</p>
        </div>
      </div>

      {resumeData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Data</h3>
            <p className="text-gray-600">No resumes have been uploaded for processing yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {resumeData.map((resume) => (
            <Card key={resume.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {resume.employee_profile?.first_name} {resume.employee_profile?.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{resume.employee_profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={resume.status === 'reviewed' ? 'default' : 'secondary'}>
                    {resume.status}
                  </Badge>
                  {resume.status === 'processed' && (
                    <Button
                      size="sm"
                      onClick={() => updateProfileMutation.mutate({
                        employeeId: resume.employee_id,
                        resumeId: resume.id
                      })}
                      disabled={updateProfileMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Projects</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">
                          {resume.extracted_data?.personal_info?.first_name} {resume.extracted_data?.personal_info?.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{resume.extracted_data?.personal_info?.phone || 'Not provided'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <p className="text-sm text-gray-900">{resume.extracted_data?.personal_info?.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="education" className="mt-4">
                    <div className="space-y-4">
                      {resume.extracted_data?.education?.map((edu, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium">{edu.degree}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-600">{edu.field_of_study} • {edu.year}</p>
                        </div>
                      )) || <p className="text-gray-600">No education information extracted</p>}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="experience" className="mt-4">
                    <div className="space-y-4">
                      {resume.extracted_data?.work_experience?.map((exp, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium">{exp.position}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                          <p className="text-sm text-gray-900 mt-2">{exp.description}</p>
                        </div>
                      )) || <p className="text-gray-600">No work experience information extracted</p>}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="skills" className="mt-4">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <Code className="w-5 h-5 text-blue-600 mr-2" />
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resume.extracted_data?.skills?.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          )) || <p className="text-gray-600">No skills extracted</p>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Projects</h4>
                        <div className="space-y-3">
                          {resume.extracted_data?.projects?.map((project, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <h5 className="font-medium">{project.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                              {project.technologies && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.technologies.map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="secondary" className="text-xs">{tech}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )) || <p className="text-gray-600">No projects extracted</p>}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeDataViewer;
