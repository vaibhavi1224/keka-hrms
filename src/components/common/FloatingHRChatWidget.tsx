import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import HRChatbot from '@/components/hr/HRChatbot';

const FloatingHRChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  // Auto-show welcome message after 5 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowWelcome(true);
        // Hide welcome message after 5 seconds
        setTimeout(() => setShowWelcome(false), 5000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowWelcome(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't allow dragging when chat is open
    setIsDragging(true);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setPosition({
        x: Math.max(20, Math.min(newX, maxX)),
        y: Math.max(20, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]"
          style={{ 
            right: `${position.x}px`,
            bottom: `${position.y + 80}px`
          }}
        >
          <Card className="w-full h-full shadow-2xl border-2 border-blue-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">HR Assistant</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-700 rounded"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Chat Content */}
            <div className="h-[calc(100%-3.5rem)]">
              <HRChatbot isWidget={true} />
            </div>
          </Card>
        </div>
      )}

      {/* Floating Chat Icon */}
      <div
        className={`fixed z-40 ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
        style={{ 
          right: `${position.x}px`,
          bottom: `${position.y}px`
        }}
        onMouseDown={handleMouseDown}
        onClick={handleToggle}
      >
        <div className="relative">
          {/* Chat Icon */}
          <div className={`
            w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full 
            flex items-center justify-center shadow-lg transition-all duration-200
            ${isOpen ? 'scale-110' : 'hover:scale-105'}
          `}>
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </div>

          {/* Welcome Message Tooltip */}
          {showWelcome && !isOpen && (
            <div className="absolute bottom-16 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 animate-fade-in">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Hi there! 👋</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Need help with HR questions? I'm here to assist you!
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWelcome(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Arrow pointing to chat icon */}
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </div>
          )}

          {/* Notification Badge (optional - can be used for unread messages) */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              •
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingHRChatWidget;
