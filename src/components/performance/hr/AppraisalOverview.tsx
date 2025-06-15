
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, User } from 'lucide-react';

const AppraisalOverview = () => {
  const { data: appraisals = [], isLoading } = useQuery({
    queryKey: ['appraisals-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          *,
          employee:profiles!appraisals_employee_id_fkey(first_name, last_name, department),
          review_cycle:review_cycles(name, cycle_type),
          decided_by_profile:profiles!appraisals_decided_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800';
    if (rating >= 3.5) return 'bg-blue-100 text-blue-800';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Appraisal Overview</h2>
          <p className="text-gray-600">Review and manage all employee appraisals</p>
        </div>
      </div>

      {/* Appraisals List */}
      <div className="space-y-4">
        {appraisals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appraisals</h3>
              <p className="text-gray-600">Appraisals will appear here once review cycles are completed.</p>
            </CardContent>
          </Card>
        ) : (
          appraisals.map((appraisal) => (
            <Card key={appraisal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{appraisal.employee?.first_name} {appraisal.employee?.last_name}</span>
                      {appraisal.final_rating && (
                        <Badge className={getRatingColor(parseFloat(String(appraisal.final_rating)))}>
                          {String(appraisal.final_rating)}/5.0
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{appraisal.review_cycle?.name}</span>
                      </span>
                      <span>{appraisal.employee?.department}</span>
                      {appraisal.decided_by_profile && (
                        <span>Decided by {appraisal.decided_by_profile.first_name} {appraisal.decided_by_profile.last_name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {appraisal.promotion_eligible && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Promotion Eligible
                      </Badge>
                    )}
                    {appraisal.salary_increment && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Increment: ₹{appraisal.salary_increment}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {appraisal.remarks && (
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Remarks</h4>
                    <p className="text-gray-700">{appraisal.remarks}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AppraisalOverview;
