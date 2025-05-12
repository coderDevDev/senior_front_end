import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import { Fingerprint, Loader2, Save, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FingerprintListener } from './FingerprintListener';
import { FingerprintService } from './fingerprint-sdk';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import supabase from '@/shared/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface RegisterFingerprintParams {
  seniorId: string;
  templateData: string;
  qualityScore: number;
  fingerPosition?: string;
}

const MAX_PRINTS = 3;

// Form schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number is too short'),
  address: z.string().min(5, 'Address is too short'),
  birthPlace: z.string().min(2, 'Birth place is too short'),
  birthdate: z.string().optional(),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor'])
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [showScanner, setShowScanner] = useState(false);
  const [prints, setPrints] = useState<
    { img: string; template: string; quality: number }[]
  >([]);

  const fingerprintService = new FingerprintService();

  const { data: fingerprintStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['fingerprintStatus', user?.user_metadata?.id],
    enabled: !!user?.user_metadata?.id,
    queryFn: async () => {
      if (!user?.user_metadata?.id) return { hasFingerprint: false };
      const templates = await fingerprintService.getActiveTemplates(
        user.user_metadata.id
      );
      return { hasFingerprint: templates.length > 0 };
    }
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      seniorId,
      templateData,
      qualityScore,
      fingerPosition = 'right_thumb'
    }: RegisterFingerprintParams) => {
      const ok = await fingerprintService.registerFingerprint(
        seniorId,
        templateData,
        qualityScore,
        fingerPosition
      );

      console.log('Registering fingerprint', {
        seniorId,
        templateData,
        qualityScore,
        fingerPosition
      });

      if (!ok) {
        throw new Error(
          'Failed to register fingerprint. Please check the logs for details.'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fingerprintStatus', user?.user_metadata?.id]
      });
      toast.success('Fingerprint registered successfully!');
      setShowScanner(false);
      setPrints([]);
    },
    onError: (e: Error) =>
      toast.error(e.message || 'Failed to register fingerprint')
  });

  // Fetch user profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data: seniorData, error: seniorError } = await supabase
        .from('senior_citizens')
        .select('*')
        .eq('user_uid', user?.id)
        .single();

      if (seniorError) throw seniorError;

      const { data: userData, error: userError } = await supabase
        .from('sb_users')
        .select('*')
        .eq('user_uid', user?.id)
        .single();

      if (userError) throw userError;

      return { ...seniorData, ...userData };
    },
    enabled: !!user?.id
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      middleName: profile?.middleName || '',
      email: profile?.email || '',
      contactNumber: profile?.contactNumber || '',
      address: profile?.address || '',
      birthPlace: profile?.birthPlace || '',
      birthdate: profile?.birthdate
        ? new Date(profile.birthdate).toISOString().split('T')[0]
        : '',
      healthStatus: profile?.healthStatus || 'good'
    }
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Update senior_citizens table
      const { error: seniorError } = await supabase
        .from('senior_citizens')
        .update({
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          healthStatus: data.healthStatus,
          address: data.address,
          birthPlace: data.birthPlace,
          birthdate: data.birthdate,
          contactNumber: data.contactNumber,
          updatedAt: new Date().toISOString()
        })
        .eq('user_uid', user?.id);

      if (seniorError) throw seniorError;

      // Update sb_users table
      const { error: userError } = await supabase
        .from('sb_users')
        .update({
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          email: data.email,
          address: data.address,
          birthPlace: data.birthPlace,
          birthDate: data.birthdate,
          contactNo: data.contactNumber,
          updated_at: new Date()
        })
        .eq('user_uid', user?.id);

      if (userError) throw userError;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: error => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };

  const handleSocketPrint = (data: {
    fingerprint_image: string;
    template: string;
    quality?: number;
  }) => {
    setPrints(prev => {
      if (prev.length >= MAX_PRINTS) return prev;
      return [
        ...prev,
        {
          img: data.fingerprint_image,
          template: data.template,
          quality: data.quality ?? 0
        }
      ];
    });

    if (!registerMutation.isPending && prints.length === 0) {
      toast.loading('Registering fingerprint...', { id: 'fp' });
      registerMutation
        .mutateAsync({
          seniorId: user!.user_metadata.id,
          templateData: data.template,
          qualityScore: data.quality ?? 0
        })
        .finally(() => toast.dismiss('fp'));
    }
  };

  const hasFingerprint = fingerprintStatus?.hasFingerprint ?? false;

  const openScanner = () => setShowScanner(true);
  const closeScanner = () => {
    setShowScanner(false);
    setPrints([]);
  };

  if (isProfileLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input {...form.register('firstName')} />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input {...form.register('lastName')} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input {...form.register('middleName')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input {...form.register('email')} type="email" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input {...form.register('contactNumber')} />
                {form.formState.errors.contactNumber && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.contactNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birth Date</Label>
                <Input {...form.register('birthdate')} type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthPlace">Birth Place</Label>
                <Input {...form.register('birthPlace')} />
                {form.formState.errors.birthPlace && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.birthPlace.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthStatus">Health Status</Label>
                <Select
                  onValueChange={value =>
                    form.setValue('healthStatus', value as any)
                  }
                  defaultValue={form.getValues('healthStatus')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select health status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input {...form.register('address')} />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full md:w-auto">
                {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            Fingerprint Registration
          </h2>

          {isCheckingStatus ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
          ) : showScanner ? (
            <>
              <FingerprintListener onCapture={handleSocketPrint} />
              <div className="flex gap-4 mt-6">
                <Button
                  variant="secondary"
                  onClick={closeScanner}
                  disabled={registerMutation.isPending}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </>
          ) : hasFingerprint ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-8 w-8 text-green-600" />
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Fingerprint registered successfully!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-8 w-8 text-blue-600" />
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    No Fingerprint Registered
                  </p>
                </div>
              </div>
              <Button
                onClick={openScanner}
                disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering…
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Register Fingerprint
                  </>
                )}
              </Button>
            </div>
          )}

          {prints.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {prints.map((p, i) => (
                <img
                  key={i}
                  src={`data:image/png;base64,${p.img}`}
                  alt={`Fingerprint ${i + 1}`}
                  className="rounded shadow"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
