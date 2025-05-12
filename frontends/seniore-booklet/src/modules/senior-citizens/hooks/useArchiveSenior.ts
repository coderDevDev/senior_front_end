import { toast } from 'sonner';
import supabase from '@/shared/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useArchiveSenior = () => {
  const queryClient = useQueryClient();

  const { mutate: archiveSeniorHandler, isPending } = useMutation({
    mutationFn: async (senior: any) => {
      const { error } = await supabase
        .from('senior_citizens')
        .update({ is_archived: true })
        .eq('id', senior.id);

      if (error) throw error;
      return senior;
    },
    onSuccess: () => {
      toast.success('Senior citizen archived successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['senior_citizens'] });
    },
    onError: error => {
      console.error('Error archiving senior:', error);
      toast.error('Failed to archive senior citizen');
    }
  });

  return { archiveSeniorHandler, isPending };
};

export const useUnarchiveSenior = () => {
  const queryClient = useQueryClient();

  const { mutate: UnarchiveSeniorHandler, isPending } = useMutation({
    mutationFn: async (senior: any) => {
      const { error } = await supabase
        .from('senior_citizens')
        .update({ is_archived: false })
        .eq('id', senior.id);

      if (error) throw error;
      return senior;
    },
    onSuccess: () => {
      toast.success('Senior citizen unarchived successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['senior_citizens'] });
    },
    onError: error => {
      console.error('Error unarchiving senior:', error);
      toast.error('Failed to unarchive senior citizen');
    }
  });

  return { UnarchiveSeniorHandler, isPending };
};
