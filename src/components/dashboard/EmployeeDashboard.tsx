
import React from 'react';
import { Clock, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle, MapPin, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EmployeeDashboard = () => {
  const personalStats = [
    { label: 'Hours This Week', value: '38.5', target: '40', icon: Clock, color: 'blue' },
    { label: 'Leave Balance', value: '12', unit: 'days', icon: Calendar, color: 'green' },
    { label: 'This Month Salary', value: '$4,250', status: 'processed', icon: DollarSign, color: 'yellow' },
    { label: 'Performance Score', value: '4.2/5', change: '+0.2', icon: TrendingUp, color: 'purple' },
  ];

  const todaySchedule = [
    { time: '9:00 AM', task: 'Daily Standup', type: 'meeting', status: 'upcoming' },
    { time: '10:30 AM', task: 'Code Review', type: 'work', status: 'upcoming' },
    { time: '2:00 PM', task: 'Client Presentation', type: 'meeting', status: 'upcoming' },
    { time: '4:00 PM', task: 'Team Planning', type: 'meeting', status: 'upcoming' },
  ];

  const quickActions = [
    { title: 'Clock In/Out', subtitle: 'Track attendance', color: 'bg-blue-600 hover:bg-blue-700', icon: Clock },
    { title: 'Apply Leave', subtitle: 'Request time off', color: 'bg-green-600 hover:bg-green-700', icon: Calendar },
    { title: 'View Payslip', subtitle: 'Download payslip', color: 'bg-purple-600 hover:bg-purple-700', icon: DollarSign },
    { title: 'Update Profile', subtitle: 'Manage details', color: 'bg-orange-600 hover:bg-orange-700', icon: Award },
  ];

  const recentAnnouncements = [
    { title: 'New Health Insurance Policy', date: '2 days ago', type: 'policy' },
    { title: 'Office Maintenance - 15th Dec', date: '1 week ago', type: 'notice' },
    { title: 'Holiday Calendar Updated', date: '2 weeks ago', type: 'info' },
  ];

  const performanceMetrics = [
    { metric: 'Tasks Completed', value: '24', target: '25', percentage: 96 },
    { metric: 'Attendance Rate', value: '98%', target: '95%', percentage: 100 },
    { metric: 'Training Progress', value: '3/4', target: '4', percentage: 75 },
    { metric: 'Goal Achievement', value: '85%', target: '80%', percentage: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Clock In/Out */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-600 mt-1">Here's your personal dashboard and today's overview</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <MapPin className="w-4 h-4 mr-2" />
            Clock In
          </Button>
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            View Timesheet
          </Button>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            purple: 'bg-purple-50 text-purple-600',
          };
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                      {stat.unit && <span className="text-sm text-gray-600 ml-1">{stat.unit}</span>}
                    </p>
                    {stat.target && (
                      <p className="text-sm text-gray-500 mt-1">Target: {stat.target}</p>
                    )}
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    )}
                    {stat.status && (
                      <p className="text-sm text-blue-600 mt-1">{stat.status}</p>
                    )}
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

      {/* Quick Actions & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs opacity-90">{action.subtitle}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">{item.task}</p>
                      <p className="text-sm text-gray-600">{item.time}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    item.type === 'meeting' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Performance This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                    <span className="text-sm text-gray-600">{metric.value} / {metric.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.percentage >= 100 ? 'bg-green-500' :
                        metric.percentage >= 80 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      announcement.type === 'policy' ? 'bg-red-500' :
                      announcement.type === 'notice' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{announcement.title}</p>
                      <p className="text-sm text-gray-600">{announcement.date}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Read</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>This Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">38.5 hrs</div>
              <div className="text-sm text-gray-600">Hours Worked</div>
              <div className="text-xs text-blue-600 mt-1">1.5 hrs remaining</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">5/5</div>
              <div className="text-sm text-gray-600">Days Present</div>
              <div className="text-xs text-green-600 mt-1">Perfect attendance</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
              <div className="text-xs text-purple-600 mt-1">Above target</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
