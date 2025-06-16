
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingHRChatWidget from '@/components/common/FloatingHRChatWidget';
import { useProfile } from '@/hooks/useProfile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || 'employee';
  const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header userRole={userRole} userName={userName} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Floating HR Chat Widget - Available on all pages */}
      <FloatingHRChatWidget />
    </div>
  );
};

export default Layout;
