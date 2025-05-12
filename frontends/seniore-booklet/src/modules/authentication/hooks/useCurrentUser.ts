import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';

export default function useCurrentUser() {
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  });

  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sb_users')
        .select('userRole')
        .eq('user_uid', user!.id)
        .single();

      if (error) throw error;

      // Update user metadata with role
      if (user && data) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            role: data.userRole
          }
        };
        return updatedUser;
      }

      return user;
    }
  });

  return {
    user: userRole || user,
    isLoading: authLoading || roleLoading
  };
}
