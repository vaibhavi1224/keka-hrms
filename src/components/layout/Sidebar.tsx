
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  MessageSquare,
  Settings,
  UserCheck,
  Building
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = ({ className }: SidebarProps) => {
  const { profile } = useProfile();
  const currentPath = window.location.pathname;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['hr', 'manager', 'employee']
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['hr', 'manager']
    },
    {
      name: 'Employee Management',
      href: '/employee-management',
      icon: Building,
      roles: ['hr']
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Clock,
      roles: ['hr', 'manager', 'employee']
    },
    {
      name: 'Leave Management',
      href: '/leave',
      icon: Calendar,
      roles: ['hr', 'manager', 'employee']
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: DollarSign,
      roles: ['hr']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['hr', 'manager']
    },
    {
      name: 'HR Assistant',
      href: '/hr-chat',
      icon: MessageSquare,
      roles: ['hr', 'manager', 'employee']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(profile?.role || 'employee')
  );

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            AI HRMS
          </h2>
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={currentPath === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => window.location.href = item.href}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
