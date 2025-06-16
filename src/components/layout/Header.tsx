
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import NotificationCenter from '@/components/common/NotificationCenter';
import HRMSLogo from '@/components/common/HRMSLogo';

const Header = () => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const userEmail = user?.email || 'User';
  const userInitials = userEmail.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <HRMSLogo size="sm" />
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            HRMS System
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Real-time Notifications */}
          <NotificationCenter />
          
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={userEmail} />
              <AvatarFallback>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              <p className="text-xs text-gray-500">Employee</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
