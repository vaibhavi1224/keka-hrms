
import { supabase } from '@/integrations/supabase/client';

export async function createSalaryStructure(employeeId: string) {
  // Check if salary structure already exists
  const { data: existingStructure } = await supabase
    .from('salary_structures')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .single();

  if (existingStructure) {
    return; // Already has a salary structure
  }

  // Generate realistic salary structure based on role/department
  const baseSalary = generateBaseSalary();
  const hra = Math.round(baseSalary * 0.4); // 40% of basic
  const specialAllowance = Math.round(baseSalary * 0.3); // 30% of basic
  const transportAllowance = 3000;
  const medicalAllowance = 2000;
  const otherAllowances = 1000;
  const ctc = baseSalary + hra + specialAllowance + transportAllowance + medicalAllowance + otherAllowances;

  const { error } = await supabase
    .from('salary_structures')
    .insert({
      employee_id: employeeId,
      basic_salary: baseSalary,
      hra: hra,
      special_allowance: specialAllowance,
      transport_allowance: transportAllowance,
      medical_allowance: medicalAllowance,
      other_allowances: otherAllowances,
      ctc: ctc,
      effective_from: new Date().toISOString().split('T')[0],
      created_by: employeeId // Using employee id as creator for seeding
    });

  if (error) {
    throw error;
  }
}

export function generateBaseSalary(): number {
  // Generate realistic base salaries between 25k to 80k
  const salaryRanges = [
    { min: 25000, max: 35000, weight: 0.3 }, // Junior roles
    { min: 35000, max: 50000, weight: 0.4 }, // Mid-level roles
    { min: 50000, max: 65000, weight: 0.2 }, // Senior roles
    { min: 65000, max: 80000, weight: 0.1 }  // Lead roles
  ];

  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const range of salaryRanges) {
    cumulativeWeight += range.weight;
    if (random <= cumulativeWeight) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
  }
  
  return 40000; // Fallback
}
