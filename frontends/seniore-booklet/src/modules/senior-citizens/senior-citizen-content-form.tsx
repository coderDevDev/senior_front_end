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

const SeniorCitizenContentForm = () => {
  const form = useForm<SeniorCitizenFormValues>({
    resolver: zodResolver(seniorCitizenSchema),
    mode: 'onTouched'
    //defaultValues: defaultValues
  });

  const { isAddingUser, createUser } = useAddSeniorCitizen();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const resetForm = () => {
  //   form.reset(defaultValues);
  // };

  const onSubmit: SubmitHandler<SeniorCitizenFormValues | any> = async (
    data: SeniorCitizenFormValues
  ) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        middleName,
        age,
        healthStatus,
        contactNumber,
        profileImg
      } = data;
      const seniorCitizenData = {
        firstName,
        lastName,
        middleName,
        age,
        healthStatus,
        contactNumber,
        profileImg,
        email,
        password
      };

      console.log(seniorCitizenData);
      await createUser(seniorCitizenData);

      //resetForm();
      setIsOpen(false);

      console.log(form.getValues());
    } catch (err) {
      console.error(`[SubmittingError]: ${err}`);
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
          <SeniorCitizenForm form={form} onSubmit={onSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeniorCitizenContentForm;
