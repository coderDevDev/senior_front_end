import { checkFingerprintStatus } from "@/modules/senior-citizens/profiles/services/user.service";
import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type FingerPosition = 
  'right_thumb' | 'right_index' | 'right_middle' | 'right_ring' | 'right_little' |
  'left_thumb' | 'left_index' | 'left_middle' | 'left_ring' | 'left_little';

export interface FingerprintRegistrationData {
  seniorId: string;
  templateData: string;
  fingerPosition?: FingerPosition;
  qualityScore?: number;
}

// Query key factory for fingerprints
const fingerprintKeys = {
  status: (seniorId: string) => [Q_KEYS.FINGERPRINT_STATUS, seniorId] as const,
};

// Hook to check fingerprint status
export const useFingerprintStatus = (seniorId: string) => {
  return useQuery({
    queryKey: fingerprintKeys.status(seniorId),
    queryFn: () => checkFingerprintStatus(seniorId),
    refetchOnWindowFocus: false,
  });
};

// Hook to register a fingerprint
export function useRegisterFingerprint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FingerprintRegistrationData) => {
      console.log('Registering fingerprint with data:', {
        seniorId: data.seniorId,
        fingerPosition: data.fingerPosition || 'right_thumb',
        qualityScore: data.qualityScore || 80,
        templateLength: data.templateData.length
      });
      
      // Validate the input data before sending
      if (!data.templateData) {
        throw new Error('Fingerprint template data is required');
      }
      
      if (!data.seniorId) {
        throw new Error('Senior ID is required');
      }
      let templateData = data.templateData;
      
      if (templateData.includes('base64,')) {
        templateData = templateData.split('base64,')[1];
      }
      
      // Remove any non-base64 characters that might be in the string
      templateData = templateData.replace(/[^A-Za-z0-9+/=]/g, '');
      
      const response = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_SERVER_URL}/api/v1/fingerprints/register`,
        data: {
          senior_id: data.seniorId,
          template_data: data.templateData,
          finger_position: data.fingerPosition || 'right_thumb',
          quality_score: data.qualityScore || 80
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate fingerprint status query to force a refresh
      queryClient.invalidateQueries({
        queryKey: ['fingerprint-status', variables.seniorId]
      });
    }
  });
}

// Hook to delete a fingerprint
// export const useDeleteFingerprint = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (seniorId: string) => deleteFingerprint(seniorId),
//     onSuccess: (_, seniorId) => {
//       // Invalidate fingerprint status query to reflect deletion
//       queryClient.invalidateQueries({ queryKey: fingerprintKeys.status(seniorId) });
//     },
//     onError: (error: Error) => {
//       console.error('Fingerprint deletion error:', error.message);
//     },
//   });
// };


// TODO: Utils -- Folder
// function isValidBase64(str: string): boolean {
//   if (!str) return false;
  
//   // Extract base64 part if it's a data URL
//   if (str.includes('data:') && str.includes('base64,')) {
//     str = str.split('base64,')[1];
//   }
  
//   // Check if it's a valid base64 string
//   return /^[A-Za-z0-9+/=]+$/.test(str);
// }
