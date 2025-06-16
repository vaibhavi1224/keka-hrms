
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingHRChatWidget from '@/components/common/FloatingHRChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
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
