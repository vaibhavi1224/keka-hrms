
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

const LeaveCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { profile } = useProfile();

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leave-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          profiles!leave_requests_user_id_fkey(first_name, last_name)
        `)
        .eq('status', 'approved');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile
  });

  const getLeaveEvents = () => {
    const events: { [key: string]: any[] } = {};
    
    leaveRequests.forEach((leave) => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      
      // Create events for each day in the leave period
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!events[dateKey]) {
          events[dateKey] = [];
        }
        events[dateKey].push({
          ...leave,
          isStart: d.toDateString() === startDate.toDateString(),
          isEnd: d.toDateString() === endDate.toDateString()
        });
      }
    });
    
    return events;
  };

  const leaveEvents = getLeaveEvents();

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    return leaveEvents[dateKey] || [];
  };

  const modifiers = {
    leave: Object.keys(leaveEvents).map(date => new Date(date))
  };

  const modifiersStyles = {
    leave: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      fontWeight: 'bold'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Leave Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">Approved Leave Days</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">
              {selectedDate 
                ? `Events on ${selectedDate.toDateString()}`
                : 'Select a date to view events'
              }
            </h3>
            
            {getSelectedDateEvents().length === 0 ? (
              <p className="text-gray-500 text-sm">No leave events on this date.</p>
            ) : (
              <div className="space-y-3">
                {getSelectedDateEvents().map((event, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="font-medium text-blue-900">
                      {event.profiles?.first_name} {event.profiles?.last_name}
                    </div>
                    <div className="text-sm text-blue-700">{event.leave_type}</div>
                    <div className="text-xs text-blue-600">
                      {event.start_date} to {event.end_date}
                      {event.reason && (
                        <div className="mt-1">Reason: {event.reason}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendar;
