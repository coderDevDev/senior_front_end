import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import { Fingerprint, Loader2, Save, User, X, Upload } from 'lucide-react';
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
import { Spinner } from '@/components/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const queryClient = useQueryClient();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const fingerprintService = new FingerprintService();
  const [showScanner, setShowScanner] = useState(false);
  const [prints, setPrints] = useState<Fingerprint[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Fetch senior citizen data from senior_citizens table
  const { data: seniorData, isLoading: isSeniorDataLoading } = useQuery({
    queryKey: ['senior-profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senior_citizens')
        .select('*')
        .eq('user_uid', user?.id)
        .single();

      if (error) {
        console.error('Error fetching senior data:', error);
        throw error;
      }

      console.log('Senior data from DB:', data);
      return data;
    }
  });

  // Initialize form with empty values that will be filled when user data loads
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      contactNumber: '',
      address: '',
      birthPlace: '',
      birthdate: '',
      healthStatus: 'good'
    }
  });

  // Add the missing registerMutation definition
  const registerMutation = useMutation({
    mutationFn: async (params: RegisterFingerprintParams) => {
      return await fingerprintService.registerFingerprint(
        params.seniorId,
        params.templateData,
        params.qualityScore,
        params.fingerPosition
      );
    },
    onSuccess: () => {
      toast.success('Fingerprint registered successfully');
      setShowScanner(false);
      setPrints([]);
      queryClient.invalidateQueries(['fingerprintStatus', user?.id]);
    },
    onError: error => {
      console.error('Fingerprint registration error:', error);
      toast.error('Failed to register fingerprint');
    }
  });

  // Set profile image URL if available in user data
  useEffect(() => {
    if (user?.user_metadata?.profileImg) {
      setProfileImageUrl(user.user_metadata.profileImg);
    }
  }, [user]);

  // Populate form when user data is available
  useEffect(() => {
    if (!isUserLoading && user && seniorData) {
      // Safely access nested properties with optional chaining
      form.reset({
        firstName:
          seniorData?.firstName || user?.user_metadata?.firstName || '',
        lastName: seniorData?.lastName || user?.user_metadata?.lastName || '',
        middleName:
          seniorData?.middleName || user?.user_metadata?.middleName || '',
        email: user?.email || '',
        contactNumber: seniorData?.contactNumber || '',
        address: seniorData?.address || '',
        birthPlace: seniorData?.birthPlace || '',
        birthdate: seniorData?.birthdate || '',
        healthStatus: seniorData?.healthStatus || 'good'
      });

      // Set profile image if available
      if (seniorData?.profileImg) {
        setProfileImageUrl(seniorData.profileImg);
      }
    }
  }, [user, isUserLoading, seniorData, form]);

  // Check fingerprint status
  const { data: fingerprintStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['fingerprintStatus', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return { hasFingerprint: false };
      try {
        const templates = await fingerprintService.getActiveTemplates(user.id);
        return { hasFingerprint: templates.length > 0 };
      } catch (error) {
        console.error('Error checking fingerprint status:', error);
        return { hasFingerprint: false };
      }
    }
  });

  // Handle profile update
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user?.id) throw new Error('User not found');

      const { error } = await supabase
        .from('senior_citizens')
        .update({
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          contactNumber: data.contactNumber,
          address: data.address,
          birthPlace: data.birthPlace,
          birthdate: data.birthdate,
          healthStatus: data.healthStatus
        })
        .eq('user_uid', user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      // Invalidate and refetch user data
      queryClient.invalidateQueries(['auth-user']);
      queryClient.invalidateQueries(['user-role', user?.id]);
    },
    onError: error => {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  });

  // Handle profile image upload
  const uploadProfileImage = async () => {
    if (!profileImage || !user) return;

    try {
      setIsUploadingImage(true);

      // 1. Create a more unique file name that includes user details
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `profile_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      // 2. Upload to a public bucket with public access
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Try using a different bucket if 'profile-images' has strict RLS
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: true // Use upsert to replace if exists
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // 3. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      console.log({ imageUrl });

      // 4. Update user metadata with new image URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          profileImg: imageUrl
        }
      });

      if (updateError) {
        console.error('User update error:', updateError);
        throw updateError;
      }

      // 5. Update local state and refresh data
      setProfileImageUrl(imageUrl);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
      setProfileImage(null); // Reset selected file
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleScannerData = async (data: any) => {
    setPrints(prev => [...prev, data]);
    if (prints.length + 1 >= MAX_PRINTS) {
      setShowScanner(false);
      await registerMutation.mutateAsync({
        seniorId: user!.id,
        templateData: data.template,
        qualityScore: data.quality ?? 0
      });
    }
  };

  const handleProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const openScanner = () => {
    setPrints([]);
    setShowScanner(true);
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImageUrl || ''} />
                <AvatarFallback>
                  {user?.user_metadata?.firstName?.[0]}
                  {user?.user_metadata?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2 w-full">
                <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploadingImage}
                  />
                </label>

                {profileImage && (
                  <Button
                    onClick={uploadProfileImage}
                    disabled={isUploadingImage || !profileImage}
                    className="w-full">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Image'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="flex-1 space-y-4 w-full">
              <form
                onSubmit={form.handleSubmit(handleProfileSubmit)}
                className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...form.register('firstName')} />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...form.register('lastName')} />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" {...form.register('middleName')} />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...form.register('email')}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      {...form.register('contactNumber')}
                    />
                    {form.formState.errors.contactNumber && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
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

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...form.register('address')} />
                    {form.formState.errors.address && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="birthdate">Birth Date</Label>
                    <Input
                      id="birthdate"
                      type="date"
                      {...form.register('birthdate')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthPlace">Birth Place</Label>
                    <Input id="birthPlace" {...form.register('birthPlace')} />
                    {form.formState.errors.birthPlace && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.birthPlace.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fingerprint Registration Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Fingerprint Registration
          </h2>

          {showScanner ? (
            <div className="space-y-4">
              <FingerprintListener
                onData={handleScannerData}
                onError={error => console.error(error)}
              />
              <Button onClick={() => setShowScanner(false)} variant="outline">
                Cancel
              </Button>
            </div>
          ) : fingerprintStatus?.hasFingerprint ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-8 w-8 text-green-600" />
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Fingerprint Already Registered
                  </p>
                </div>
              </div>
              <Button onClick={openScanner}>Register New Fingerprint</Button>
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
