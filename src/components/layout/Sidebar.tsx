import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Users, Calendar, FileText, DollarSign, BarChart, MessageCircle, TrendingUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  roles: string[];
}

const Sidebar = () => {
  const { profile } = useProfile();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/',
      roles: ['employee', 'manager', 'hr']
    },
    { 
      icon: Users, 
      label: 'Employees', 
      path: '/employees',
      roles: ['manager', 'hr']
    },
    { 
      icon: Calendar, 
      label: 'Attendance', 
      path: '/attendance',
      roles: ['employee', 'manager', 'hr']
    },
    { 
      icon: FileText, 
      label: 'Leave', 
      path: '/leave',
      roles: ['employee', 'manager', 'hr']
    },
    { 
      icon: DollarSign, 
      label: 'Payroll', 
      path: '/payroll',
      roles: ['hr']
    },
    { 
      icon: TrendingUp, 
      label: 'Performance', 
      path: '/performance',
      roles: ['employee', 'manager', 'hr']
    },
    { 
      icon: BarChart, 
      label: 'Analytics', 
      path: '/analytics',
      roles: ['manager', 'hr']
    },
    { 
      icon: MessageCircle, 
      label: 'HR Chat', 
      path: '/hr-chat',
      roles: ['employee', 'manager', 'hr']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="w-64 bg-gray-100 h-full py-4 px-3 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">HRMS</h1>
        <p className="text-sm text-gray-500">Your Company</p>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-200 ${
                  isActive(item.path) ? 'bg-gray-200 font-medium' : 'text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto text-center">
        <p className="text-xs text-gray-500">Version 0.1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
