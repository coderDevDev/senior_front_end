/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger
} from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAddSeniorCitizen } from './profiles/hooks/useAddSeniorCitizen';
import SeniorCitizenForm from './senior-citizen-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import {
  seniorCitizenSchema,
  type SeniorCitizenFormValues
} from './senior-citizen-content-form.ts';

import supabase from '@/shared/supabase.ts';
import { toast } from 'sonner';

// const defaultValues = {
//   firstName: "",
//   lastName: "",
//   middleName: "",
//   age: "60",
//   healthStatus: "good",
//   emergencyContact: "",
//   profileImg: undefined,
// }

export type SeniorCitizenFormValues = z.infer<typeof seniorCitizenSchema>;

interface SeniorFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  age: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  contactNumber: string;
  profileImg?: any;
}

const SeniorCitizenContentForm = () => {
  const form = useForm<SeniorFormValues>({
    resolver: zodResolver(seniorCitizenSchema),
    mode: 'onTouched',
    defaultValues: {
      healthStatus: 'good',
      age: 60
    }
  });

  const { createUser } = useAddSeniorCitizen();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onSubmit = async (data: SeniorFormValues) => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            userRole: 'senior_citizen'
          }
        }
      });

      if (authError) throw authError;

      // Insert into sb_users table
      const { error: userError } = await supabase.from('sb_users').insert({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        email: data.email,
        password: data.password,
        userRole: 'senior_citizen',
        user_uid: authData.user?.id,
        contactNo: data.contactNumber,
        email_verified: false,
        created_at: new Date().toISOString()
      });

      if (userError) throw userError;

      // Insert into senior_citizens table
      const { error: seniorError } = await supabase
        .from('senior_citizens')
        .insert({
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          email: data.email,
          password: data.password,
          userRole: 'senior_citizen',
          user_uid: authData.user?.id,
          contactNumber: data.contactNumber,
          isEmailVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          age: data.age,
          healthStatus: data.healthStatus,
          profileImg: data.profileImg
        });

      if (seniorError) throw seniorError;

      toast.success('Senior citizen added successfully!');
      form.reset();
      setIsOpen(false);
    } catch (err) {
      console.error('[SubmittingError]:', err);
      toast.error('Failed to add senior citizen. Please try again.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Senior Citizen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] md:w-[90vw] p-0">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
          <DialogTitle className="text-xl font-semibold">
            Add New Senior Citizen
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-4 max-h-[calc(90vh-8rem)]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SeniorCitizenForm form={form} isAdminForm={true} />
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                Save Senior Citizen
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeniorCitizenContentForm;
