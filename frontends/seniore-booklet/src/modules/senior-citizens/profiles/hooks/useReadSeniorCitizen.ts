import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';

const QUERY_KEY = 'senior_citizens';

const useReadSeniorCitizens = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senior_citizens')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching senior citizens:', error);
        throw error;
      }

      return {
        data: {
          data: {
            seniorCitizens: data,
            // Add these to match expected structure in code
            currentPage: { page: 1, limit: data?.length || 0 },
            totalPages: 1,
            totalDocs: data?.length || 0
          }
        }
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 seconds
  });
};

// Export the query key to use in other components for invalidation
export const SENIOR_CITIZENS_QUERY_KEY = QUERY_KEY;
export default useReadSeniorCitizens;
