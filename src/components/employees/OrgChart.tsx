
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Network, Users } from 'lucide-react';
import type { Employee, OrgChartNode } from '@/types/employee';

const OrgChart = () => {
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees-org-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          designation,
          department,
          reporting_manager_id,
          profile_picture,
          is_active
        `)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data as Employee[];
    }
  });

  const orgChartData = useMemo(() => {
    if (!employees.length) return [];

    // Create a map of employees by ID
    const employeeMap = new Map<string, OrgChartNode>();
    
    employees.forEach(emp => {
      employeeMap.set(emp.id, {
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
        designation: emp.designation || 'No designation',
        department: emp.department,
        manager_id: emp.reporting_manager_id,
        profile_picture: emp.profile_picture,
        children: []
      });
    });

    // Build the hierarchy
    const rootNodes: OrgChartNode[] = [];
    
    employeeMap.forEach(employee => {
      if (employee.manager_id && employeeMap.has(employee.manager_id)) {
        const manager = employeeMap.get(employee.manager_id)!;
        manager.children!.push(employee);
      } else {
        // This is a root node (no manager or manager not found)
        rootNodes.push(employee);
      }
    });

    return rootNodes;
  }, [employees]);

  const renderNode = (node: OrgChartNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div className={`mb-4 ${level > 0 ? 'ml-8' : ''}`}>
          <Card className="w-64 hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarImage src={node.profile_picture} />
                <AvatarFallback>
                  {node.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-lg mb-1">{node.name}</h3>
              <p className="text-sm text-blue-600 mb-1">{node.designation}</p>
              {node.department && (
                <p className="text-xs text-gray-500">{node.department}</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {hasChildren && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 w-px h-4 bg-gray-300 transform -translate-x-1/2"></div>
            
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              {node.children!.map(child => (
                <div key={child.id} className="relative">
                  {/* Horizontal line */}
                  <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-300 transform -translate-x-1/2"></div>
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading organization chart...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          Organization Chart
        </CardTitle>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {employees.length} active employees
        </p>
      </CardHeader>
      <CardContent>
        {orgChartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No organizational structure data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-8 min-w-max p-4">
              {orgChartData.map(rootNode => renderNode(rootNode))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrgChart;
