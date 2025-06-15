
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import PerformanceEmployee from '@/components/performance/PerformanceEmployee';
import PerformanceManager from '@/components/performance/PerformanceManager';
import PerformanceHR from '@/components/performance/PerformanceHR';

const Performance = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading performance dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate performance dashboard based on user role
  switch (profile?.role) {
    case 'hr':
      return <PerformanceHR />;
    case 'manager':
      return <PerformanceManager />;
    case 'employee':
    default:
      return <PerformanceEmployee />;
  }
};

export default Performance;
