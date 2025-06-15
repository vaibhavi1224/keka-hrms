
import React, { useState } from 'react';
import { Users, Clock, DollarSign, FileText, CheckCircle, UserPlus, MessageCircle, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SeedDataButton from '@/components/hr/SeedDataButton';

interface HRQuickActionsProps {
  onInviteEmployee: () => void;
}

const HRQuickActions = ({ onInviteEmployee }: HRQuickActionsProps) => {
  const navigate = useNavigate();
  const [showSeedData, setShowSeedData] = useState(false);

  const quickActions = [
    { 
      title: 'Add New Employee', 
      color: 'bg-blue-600 hover:bg-blue-700', 
      icon: UserPlus,
      onClick: onInviteEmployee
    },
    { 
      title: 'HR Assistant', 
      color: 'bg-purple-600 hover:bg-purple-700', 
      icon: MessageCircle,
      onClick: () => navigate('/hr-chat')
    },
    { 
      title: 'Seed Company Data', 
      color: 'bg-green-600 hover:bg-green-700', 
      icon: Database,
      onClick: () => setShowSeedData(true)
    },
    { title: 'Process Payroll', color: 'bg-orange-600 hover:bg-orange-700', icon: DollarSign },
    { title: 'Generate Reports', color: 'bg-red-600 hover:bg-red-700', icon: FileText },
    { title: 'Review Compliance', color: 'bg-indigo-600 hover:bg-indigo-700', icon: CheckCircle },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
                  onClick={action.onClick}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seed Data Modal */}
      {showSeedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Seed Company Data</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSeedData(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <SeedDataButton />
          </div>
        </div>
      )}
    </>
  );
};

export default HRQuickActions;
