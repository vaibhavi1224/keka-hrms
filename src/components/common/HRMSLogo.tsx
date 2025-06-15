
import React from 'react';
import { Users, Building2 } from 'lucide-react';

interface HRMSLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only' | 'text-only';
  className?: string;
}

const HRMSLogo = ({ size = 'md', variant = 'full', className = '' }: HRMSLogoProps) => {
  const sizeClasses = {
    sm: {
      container: 'text-lg',
      icon: 'w-6 h-6',
      text: 'text-lg',
      subtext: 'text-xs'
    },
    md: {
      container: 'text-xl',
      icon: 'w-8 h-8',
      text: 'text-xl',
      subtext: 'text-sm'
    },
    lg: {
      container: 'text-2xl',
      icon: 'w-10 h-10',
      text: 'text-2xl',
      subtext: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  if (variant === 'icon-only') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Building2 className={`${currentSize.icon} text-blue-600`} />
          <Users className={`${currentSize.icon} absolute -top-1 -right-1 text-purple-600 scale-50`} />
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${currentSize.text}`}>
            HRMS Pro
          </span>
          <span className={`text-gray-600 font-medium ${currentSize.subtext} -mt-1`}>
            AI-Enhanced
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2 shadow-lg">
          <Building2 className={`${currentSize.icon} text-white`} />
          <Users className={`absolute -top-1 -right-1 ${currentSize.icon} text-yellow-400 scale-50`} />
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className={`font-bold text-gray-900 ${currentSize.text} leading-tight`}>
          HRMS Pro
        </span>
        <span className={`text-gray-600 font-medium ${currentSize.subtext} -mt-1`}>
          AI-Enhanced
        </span>
      </div>
    </div>
  );
};

export default HRMSLogo;
