
import { ComprehensiveSeedResult } from '@/types/seedingResults';
import { executeSeedingProcess } from './seeding/seedingOrchestrator';

export async function seedAllDummyData(): Promise<ComprehensiveSeedResult> {
  return await executeSeedingProcess();
}
