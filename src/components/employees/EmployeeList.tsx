
import React from 'react';
import { Users, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EmployeeList = () => {
  const employees = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Developer',
      department: 'Engineering',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      location: 'New York',
      status: 'Active',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Product Manager',
      department: 'Product',
      email: 'mike.chen@company.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco',
      status: 'Active',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'UX Designer',
      department: 'Design',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin',
      status: 'On Leave',
      avatar: 'ED'
    },
    {
      id: 4,
      name: 'John Smith',
      role: 'DevOps Engineer',
      department: 'Engineering',
      email: 'john.smith@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle',
      status: 'Active',
      avatar: 'JS'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Employees', count: 248, color: 'bg-blue-50 text-blue-600' },
          { title: 'Active', count: 235, color: 'bg-green-50 text-green-600' },
          { title: 'On Leave', count: 8, color: 'bg-yellow-50 text-yellow-600' },
          { title: 'Inactive', count: 5, color: 'bg-red-50 text-red-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{employee.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.role} • {employee.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{employee.location}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                    employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeList;
