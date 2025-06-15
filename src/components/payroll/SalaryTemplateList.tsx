
import React from 'react';
import SalaryTemplateCard from './SalaryTemplateCard';

interface SalaryTemplate {
  id: string;
  template_name: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  ctc: number;
  created_at: string;
}

interface SalaryTemplateListProps {
  templates: SalaryTemplate[];
}

const SalaryTemplateList = ({ templates }: SalaryTemplateListProps) => {
  if (!templates.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No salary templates found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <SalaryTemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};

export default SalaryTemplateList;
