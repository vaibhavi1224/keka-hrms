
import React from 'react';
import { Users, Clock, Calendar, TrendingUp, CheckCircle, AlertTriangle, Star, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const teamStats = [
    { label: 'Team Members', value: '12', change: '+1', icon: Users, color: 'blue' },
    { label: 'Present Today', value: '11', change: '92%', icon: CheckCircle, color: 'green' },
    { label: 'Pending Approvals', value: '5', change: '3 urgent', icon: AlertTriangle, color: 'orange' },
    { label: 'Team Performance', value: '4.2/5', change: '+0.3', icon: Star, color: 'purple' },
  ];

  const recentActivities = [
    { employee: 'Sarah Johnson', action: 'submitted leave request', time: '2 hours ago', type: 'leave' },
    { employee: 'Mike Chen', action: 'completed project milestone', time: '4 hours ago', type: 'achievement' },
    { employee: 'Emily Davis', action: 'checked in late', time: '1 day ago', type: 'attendance' },
    { employee: 'John Smith', action: 'requested overtime approval', time: '2 days ago', type: 'overtime' },
  ];

  const teamPerformance = [
    { name: 'Sarah Johnson', role: 'Senior Developer', performance: 4.8, tasks: 8, status: 'excellent' },
    { name: 'Mike Chen', role: 'Designer', performance: 4.5, tasks: 6, status: 'good' },
    { name: 'Emily Davis', role: 'Developer', performance: 4.2, tasks: 7, status: 'good' },
    { name: 'John Smith', role: 'QA Engineer', performance: 3.9, tasks: 5, status: 'average' },
  ];

  const upcomingEvents = [
    { event: 'Team Standup', time: '9:00 AM', type: 'meeting' },
    { event: 'Performance Review - Sarah', time: '2:00 PM', type: 'review' },
    { event: 'Project Deadline', time: 'Tomorrow', type: 'deadline' },
    { event: 'Team Building Event', time: 'Friday', type: 'event' },
  ];

  const handleReviewLeaveRequests = () => {
    navigate('/leave');
  };

  const handleSchedulePerformanceReviews = () => {
    navigate('/performance');
  };

  const handleSetTeamGoals = () => {
    navigate('/performance');
  };

  const handleApproveOvertimeRequests = () => {
    navigate('/attendance');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your team's performance and manage daily operations</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            orange: 'bg-orange-50 text-orange-600',
            purple: 'bg-purple-50 text-purple-600',
          };
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={handleReviewLeaveRequests}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Review Leave Requests (5 pending)
              </Button>
              <Button 
                onClick={handleSchedulePerformanceReviews}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Schedule Performance Reviews
              </Button>
              <Button 
                onClick={handleSetTeamGoals}
                className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                Set Team Goals
              </Button>
              <Button 
                onClick={handleApproveOvertimeRequests}
                className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                Approve Overtime Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{member.performance}/5</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      member.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      member.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Team Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {activity.employee.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.employee}</p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{activity.time}</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      activity.type === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                      activity.type === 'achievement' ? 'bg-green-100 text-green-800' :
                      activity.type === 'attendance' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.type === 'meeting' ? 'bg-blue-500' :
                      event.type === 'review' ? 'bg-purple-500' :
                      event.type === 'deadline' ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{event.event}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
