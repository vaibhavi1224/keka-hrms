
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings,
  Home,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: 'HR' | 'Manager' | 'Employee';
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['HR', 'Manager', 'Employee'] },
    { name: 'Employees', href: '/employees', icon: Users, roles: ['HR', 'Manager'] },
    { name: 'Attendance', href: '/attendance', icon: Clock, roles: ['HR', 'Manager', 'Employee'] },
    { name: 'Leave Management', href: '/leave', icon: Calendar, roles: ['HR', 'Manager', 'Employee'] },
    { name: 'Payroll', href: '/payroll', icon: DollarSign, roles: ['HR'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['HR', 'Manager'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['HR'] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HR</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HRMS Pro</h1>
            <p className="text-xs text-gray-500 capitalize">{userRole} Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <button className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg w-full transition-colors duration-150">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
