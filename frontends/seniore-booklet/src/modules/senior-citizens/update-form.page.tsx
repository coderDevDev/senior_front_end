import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SeniorCitizenFormValues } from './senior-citizen-content-form';
import SeniorCitizenForm from './senior-citizen-form';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import supabase from '@/shared/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SENIOR_CITIZENS_QUERY_KEY } from './profiles/hooks/useReadSeniorCitizen';
import { Spinner } from '@/components/spinner';

const UpdateFormPage = ({ seniorDataForm }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [seniorData, setSeniorData] = useState<any>(null);
  const seniorId = seniorDataForm.id;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchSeniorData = async () => {
      if (!seniorId) {
        console.error('No senior ID provided');
        toast.error('Invalid senior citizen ID');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching data for senior ID:', seniorId);

        const { data, error } = await supabase
          .from('senior_citizens')
          .select('*')
          .eq('id', seniorId)
          .single();

        if (error) throw error;
        console.log('Fetched senior data for update:', data);
        setSeniorData(data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching senior data:', error);
        toast.error('Failed to load senior citizen data');
      } finally {
        setLoading(false);
      }
    };

    fetchSeniorData();
  }, [seniorId]);

  const form = useForm<SeniorCitizenFormValues>({
    defaultValues: async () => {
      if (!seniorData) return {};

      return {
        firstName: seniorData.firstName || '',
        lastName: seniorData.lastName || '',
        middleName: seniorData.middleName || '',
        email: seniorData.email || '',
        healthStatus: seniorData.healthStatus || 'good',
        age: seniorData.age || 60,
        contactNumber: seniorData.contactNumber || '',
        address: seniorData.address || '',
        birthdate: seniorData.birthdate || null,
        birthPlace: seniorData.birthPlace || '',
        password: '' // Not updating password in edit form
      };
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SeniorCitizenFormValues) => {
      console.log('Starting update mutation with data:', data);
      console.log('Senior ID for update:', seniorId);

      if (!seniorId) {
        throw new Error('Missing senior ID for update');
      }

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

      console.log('Updating senior data:', { seniorId, updateData });

      if (data.birthdate) {
        updateData['birthdate'] = data.birthdate;
      }

      const { data: updatedData, error } = await supabase
        .from('senior_citizens')
        .update(updateData)
        .eq('id', seniorId)
        .select();
      console.log('dexxx');
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful:', updatedData);
      return true;
    },
    onSuccess: () => {
      toast.success('Senior citizen updated successfully');

      // Force invalidate and refetch the query
      queryClient.invalidateQueries({ queryKey: [SENIOR_CITIZENS_QUERY_KEY] });

      // Navigate back to list view after a small delay to ensure data is refetched
      setTimeout(() => {
        if (seniorDataForm?.onSuccess) {
          seniorDataForm.onSuccess();
        } else {
          navigate('/dashboard-app/senior-citizen');
        }
      }, 300);
    },
    onError: error => {
      console.error('Update error:', error);
      toast.error(
        'Failed to update senior citizen: ' +
          (error?.message || 'Unknown error')
      );
    }
  });

  const onSubmit = (data: SeniorCitizenFormValues) => {
    console.log('Form submitted with values:', data);
    updateMutation.mutate(data);
  };

  if (loading || !isLoaded || !seniorData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    isLoaded && (
      <div className="container p-6 mx-auto">
        {/* <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Update Senior Citizen</h1>
          <Button
            variant="outline"
            onClick={() => {
              if (seniorDataForm?.onSuccess) {
                seniorDataForm.onSuccess();
              } else {
                navigate('/dashboard-app/senior-citizen');
              }
            }}>
            Cancel
          </Button>
        </div> */}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <SeniorCitizenForm seniorData={seniorData} form={form} />

          <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-800 p-4">
            {/* <Button type="button" variant="outline" onClick={() => {}}>
              Cancel
            </Button> */}
            <Button
              type="submit"
              className="bg-primary"
              disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    )
  );
};

export default UpdateFormPage;
