
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'HR' | 'Manager' | 'Employee';
  userName?: string;
}

const Layout = ({ children, userRole = 'HR', userName = 'John Doe' }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header userRole={userRole} userName={userName} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
