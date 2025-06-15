
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .rpc('get_user_permissions', { user_uuid: user.id });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  const canCreate = (resource: string) => hasPermission(resource, 'create');
  const canRead = (resource: string) => hasPermission(resource, 'read');
  const canUpdate = (resource: string) => hasPermission(resource, 'update');
  const canDelete = (resource: string) => hasPermission(resource, 'delete');

  return {
    permissions,
    isLoading,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete
  };
};
