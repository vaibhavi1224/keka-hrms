
import React from 'react';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActionsCard = () => {
  const navigate = useNavigate();

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
  );
};

export default QuickActionsCard;
