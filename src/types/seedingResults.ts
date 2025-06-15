
export interface SeedResult {
  success: number;
  errors: number;
}

export interface ComprehensiveSeedResult {
  payroll: SeedResult;
  performance: SeedResult;
  bankDetails: SeedResult;
  totalEmployees: number;
}
