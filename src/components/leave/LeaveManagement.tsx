
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LeaveManagement = () => {
  const [selectedTab, setSelectedTab] = useState('requests');

  const leaveRequests = [
    {
      id: 1,
      employee: 'Sarah Johnson',
      type: 'Annual Leave',
      startDate: '2024-06-20',
      endDate: '2024-06-22',
      days: 3,
      reason: 'Family vacation',
      status: 'Pending',
      appliedOn: '2024-06-15'
    },
    {
      id: 2,
      employee: 'Mike Chen',
      type: 'Sick Leave',
      startDate: '2024-06-18',
      endDate: '2024-06-19',
      days: 2,
      reason: 'Medical appointment',
      status: 'Approved',
      appliedOn: '2024-06-16'
    },
    {
      id: 3,
      employee: 'Emily Davis',
      type: 'Personal Leave',
      startDate: '2024-06-25',
      endDate: '2024-06-28',
      days: 4,
      reason: 'Personal matters',
      status: 'Rejected',
      appliedOn: '2024-06-14'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage employee leave requests and policies.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Requests', count: 45, color: 'bg-blue-50 text-blue-600' },
          { title: 'Pending', count: 12, color: 'bg-yellow-50 text-yellow-600' },
          { title: 'Approved', count: 28, color: 'bg-green-50 text-green-600' },
          { title: 'Rejected', count: 5, color: 'bg-red-50 text-red-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-1 mb-6">
        {[
          { id: 'requests', label: 'Leave Requests' },
          { id: 'calendar', label: 'Leave Calendar' },
          { id: 'policies', label: 'Leave Policies' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {request.employee.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.employee}</h4>
                        <p className="text-sm text-gray-500">{request.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{request.startDate}</p>
                        <p className="text-xs text-gray-500">Start Date</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{request.endDate}</p>
                        <p className="text-xs text-gray-500">End Date</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{request.days} days</p>
                        <p className="text-xs text-gray-500">Duration</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span>{request.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Applied on {request.appliedOn}</p>
                      {request.status === 'Pending' && (
                        <div className="space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveManagement;
