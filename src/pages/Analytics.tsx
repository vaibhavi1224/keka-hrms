
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useProfile } from '@/hooks/useProfile';
import { PerformanceInsights } from '@/components/dashboard/employee/PerformanceInsights';
import { PerformanceMetricsForm } from '@/components/dashboard/employee/PerformanceMetricsForm';
import { FeedbackForm } from '@/components/dashboard/employee/FeedbackForm';
import SeedPerformanceDataButton from '@/components/hr/SeedPerformanceDataButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, MessageSquare, Settings } from 'lucide-react';

const Analytics = () => {
  const { profile } = useProfile();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Performance</h1>
            <p className="text-gray-600">Track performance metrics and insights</p>
          </div>
        </div>

        {/* HR Tools Section */}
        {profile?.role === 'hr' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SeedPerformanceDataButton />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <PerformanceInsights />
          </div>
        </div>

        {/* Forms Section - Only show for employees */}
        {profile?.role === 'employee' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceMetricsForm />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <FeedbackForm />
            </div>
          </div>
        )}

        {/* HR and Manager View */}
        {(profile?.role === 'hr' || profile?.role === 'manager') && (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Team performance analytics coming soon...</p>
                  <p className="text-sm">View and analyze team performance metrics and insights.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
