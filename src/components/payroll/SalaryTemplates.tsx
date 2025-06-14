
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

const SalaryTemplates = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Salary Templates</span>
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Create reusable salary templates for quick assignment to employees.
            <br />
            <span className="text-sm">Feature coming soon...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryTemplates;
