import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';

const useReadSeniorCitizens = () => {
  return useQuery({
    queryKey: ['senior_citizens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senior_citizens')
        .select('*');

      if (error) throw error;
      return { data: { data: { seniorCitizens: data } } };
    }
  });
};

export default useReadSeniorCitizens;
