import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SeniorCitizenFormValues } from './senior-citizen-content-form';
import SeniorCitizenForm from './senior-citizen-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import supabase from '@/shared/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UpdateSeniorFormProps {
  seniorData: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    age: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    contactNumber: string;
    address?: string;
    birthdate?: string;
    birthPlace?: string;
    userRole?: string;
    profileImg?: string;
  };
  onSuccess?: () => void;
}

const UpdateSeniorForm = ({ seniorData, onSuccess }: UpdateSeniorFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<SeniorCitizenFormValues>({
    defaultValues: {
      email: seniorData.email,
      firstName: seniorData.firstName,
      lastName: seniorData.lastName,
      middleName: seniorData.middleName || '',
      healthStatus: seniorData.healthStatus,
      age: seniorData.age,
      contactNumber: seniorData.contactNumber,
      address: seniorData.address || '',
      birthdate: seniorData.birthdate || null,
      birthPlace: seniorData.birthPlace || '',
      password: '' // Not updating password in edit form
    }
  });

  const { mutate: updateSenior, isPending } = useMutation({
    mutationFn: async (data: SeniorCitizenFormValues) => {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || null,
        healthStatus: data.healthStatus,
        age: data.age,
        contactNumber: data.contactNumber,
        address: data.address || null,
        birthPlace: data.birthPlace || null,
        updatedAt: new Date().toISOString()
      };

      if (data.birthdate) {
        updateData['birthdate'] = data.birthdate;
      }

      const { error } = await supabase
        .from('senior_citizens')
        .update(updateData)
        .eq('id', seniorData.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senior_citizens'] });
      toast.success('Senior citizen updated successfully');
      onSuccess?.();
    },
    onError: error => {
      console.error('Update error:', error);
      toast.error('Failed to update senior citizen');
    }
  });

  const onSubmit = (data: SeniorCitizenFormValues) => {
    updateSenior(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SeniorCitizenForm form={form} />
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-800">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary" disabled={isPending}>
            {isPending ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateSeniorForm;
