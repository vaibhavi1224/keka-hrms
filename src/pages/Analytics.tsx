
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useProfile } from '@/hooks/useProfile';
import ReportsAnalyticsDashboard from '@/components/reports/ReportsAnalyticsDashboard';

const Analytics = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reports dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ReportsAnalyticsDashboard userRole={profile?.role || 'employee'} />
    </Layout>
  );
};

export default Analytics;
