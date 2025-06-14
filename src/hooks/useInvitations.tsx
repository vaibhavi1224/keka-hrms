
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Invitation {
  id: string;
  email: string;
  name: string;
  role: 'hr' | 'manager' | 'employee';
  department: string | null;
  designation: string | null;
  date_of_joining: string | null;
  salary: number | null;
  status: string;
  invited_at: string;
  expires_at: string;
  token: string;
}

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInvitations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update({
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          status: 'INVITED'
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchInvitations();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    loading,
    error,
    refetch: fetchInvitations,
    resendInvitation
  };
};
