
import { supabase } from '@/integrations/supabase/client';

export async function validateHRUser(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No authenticated user found');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'hr') {
    throw new Error('Only HR users can seed company data');
  }
}
