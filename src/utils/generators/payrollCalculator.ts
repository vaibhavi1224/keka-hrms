
interface SalaryStructure {
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
}

interface PayrollCalculation {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  bonus: number;
  totalEarnings: number;
  pf: number;
  tds: number;
  esi: number;
  lopDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

export function calculatePayroll(
  salaryStructure: SalaryStructure,
  workingDays: number,
  presentDays: number,
  lopDays: number
): PayrollCalculation {
  // Calculate prorated salary based on attendance
  const attendanceRatio = presentDays / workingDays;
  const basicSalary = Math.round(salaryStructure.basic_salary * attendanceRatio);
  const hra = Math.round(salaryStructure.hra * attendanceRatio);
  const specialAllowance = Math.round(salaryStructure.special_allowance * attendanceRatio);
  const transportAllowance = presentDays > 15 ? salaryStructure.transport_allowance : Math.round(salaryStructure.transport_allowance * attendanceRatio);
  const medicalAllowance = salaryStructure.medical_allowance;
  const otherAllowances = salaryStructure.other_allowances;
  
  // Random bonus (0-5000)
  const bonus = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
  
  const totalEarnings = basicSalary + hra + specialAllowance + transportAllowance + medicalAllowance + otherAllowances + bonus;
  
  // Calculate deductions
  const pf = Math.round(basicSalary * 0.12); // 12% of basic salary
  const tds = totalEarnings > 50000 ? Math.round(totalEarnings * 0.1) : 0; // 10% TDS if earnings > 50k
  const esi = totalEarnings < 25000 ? Math.round(totalEarnings * 0.0075) : 0; // 0.75% ESI if earnings < 25k
  const lopDeduction = Math.round((salaryStructure.basic_salary / workingDays) * lopDays);
  const otherDeductions = Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : 0; // Random other deductions
  
  const totalDeductions = pf + tds + esi + lopDeduction + otherDeductions;
  const netPay = totalEarnings - totalDeductions;

  return {
    basicSalary,
    hra,
    specialAllowance,
    transportAllowance,
    medicalAllowance,
    otherAllowances,
    bonus,
    totalEarnings,
    pf,
    tds,
    esi,
    lopDeduction,
    otherDeductions,
    totalDeductions,
    netPay
  };
}

export function generateAttendanceData() {
  const workingDays = 22 + Math.floor(Math.random() * 6); // 22-27 working days
  const presentDays = workingDays - Math.floor(Math.random() * 3); // 0-2 absent days
  const lopDays = workingDays - presentDays;

  return { workingDays, presentDays, lopDays };
}
