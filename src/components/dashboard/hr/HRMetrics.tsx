
import React from 'react';
import { Users, Clock, DollarSign, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HRMetricsProps {
  pendingInvitationsCount: number;
  totalEmployees: number;
  monthlyPayroll: number;
}

const HRMetrics = ({ pendingInvitationsCount, totalEmployees, monthlyPayroll }: HRMetricsProps) => {
  // Format currency for Indian Rupees
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 crore or more
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh or more
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const metrics = [
    {
      title: 'Total Employees',
      value: totalEmployees.toString(),
      change: 'Active employees',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Pending Invitations',
      value: pendingInvitationsCount.toString(),
      change: 'Awaiting response',
      icon: Mail,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Attendance Rate',
      value: '94.5%',
      change: '+2.1% vs last month',
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(monthlyPayroll),
      change: 'Current month',
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-green-600 mt-1">{metric.change}</p>
                </div>
                <div className={`${metric.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HRMetrics;
