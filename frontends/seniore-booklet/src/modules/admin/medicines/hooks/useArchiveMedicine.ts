import { useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import { IMedicine } from '../medicine.interface';
import { toast } from 'sonner';

const MEDICINE_QUERY_KEY = 'medicines';

export const useArchiveMedicine = () => {
  const queryClient = useQueryClient();

  const { mutate: archiveMedicineHandler, isPending } = useMutation({
    mutationFn: async (medicine: IMedicine) => {
      console.log('Archiving medicine:', medicine);

      const { data, error } = await supabase
        .from('medicine')
        .update({ isActive: false, isArchived: true })
        .eq('medicineId', medicine.medicineId)
        .select();

      if (error) {
        console.error('Error archiving medicine:', error);
        throw error;
      }

      console.log('Medicine archived successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Medicine archived successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [MEDICINE_QUERY_KEY] });
    },
    onError: error => {
      console.error('Failed to archive medicine:', error);
      toast.error('Failed to archive medicine');
    }
  });

  return { archiveMedicineHandler, isPending };
};

export const useUnarchiveMedicine = () => {
  const queryClient = useQueryClient();

  const { mutate: UnarchiveMedicineHandler, isPending } = useMutation({
    mutationFn: async (medicine: IMedicine) => {
      console.log('Unarchiving medicine:', medicine);

      const { data, error } = await supabase
        .from('medicine')
        .update({ isActive: true, isArchived: false })
        .eq('medicineId', medicine.medicineId)
        .select();

      if (error) {
        console.error('Error unarchiving medicine:', error);
        throw error;
      }

      console.log('Medicine unarchived successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Medicine unarchived successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [MEDICINE_QUERY_KEY] });
    },
    onError: error => {
      console.error('Failed to unarchive medicine:', error);
      toast.error('Failed to unarchive medicine');
    }
  });

  return { UnarchiveMedicineHandler, isPending };
};
