/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircleIcon } from 'lucide-react';
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useAddSeniorCitizen } from "../profiles/hooks/useAddSeniorCitizen";
import TransactionInputForm from "./transaction-input-form";

const seniorCitizenSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First Name must be at least 2 characters.",
    })
    .max(30, {
      message: "First Name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Last Name must not be longer than 30 characters.",
    }),
  middleName: z
    .string()
    .optional(),
  age: z
    .string()
    .min(60, {
      message: "Age must be at least 60 for senior citizens.",
    })
    .max(120, {
      message: "Age must not be greater than 120.",
    }),
  healthStatus: z.enum(["excellent", "good", "fair", "poor"], {
    required_error: "Please select a health status.",
  }),
  emergencyContact: z
    .string()
    .min(10, {
      message: "Emergency contact must be at least 10 characters.",
    })
    .max(50, {
      message: "Emergency contact must not be longer than 50 characters.",
    }),
  profileImg: z.any()
})

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

const TransactionContentForm = () => {
  const form = useForm<SeniorCitizenFormValues>({
    //defaultValues: defaultValues
    resolver: zodResolver(seniorCitizenSchema)
  });

  const { isAddingUser, createUser } = useAddSeniorCitizen()

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const resetForm = () => {
  //   form.reset(defaultValues);
  // };

  const onSubmit: SubmitHandler<SeniorCitizenFormValues | any> = async (data: SeniorCitizenFormValues) => {
    try {
      const { firstName, lastName, middleName, age, healthStatus, emergencyContact, profileImg } = data;
      const seniorCitizenData = {
        firstName,
        lastName,
        middleName,
        age,
        healthStatus,
        emergencyContact,
        profileImg,
      }

      console.log(seniorCitizenData)
      await createUser(seniorCitizenData as any)

      //resetForm();
      setIsOpen(false)

      console.log(form.getValues())

    } catch (err) {
      console.error(`[SubmittingError]: ${err}`)
    }
  }

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          className="h-8 gap-1 bg-[#0B0400]"
          size="sm"
          variant={"gooeyLeft"}
          onClick={() => setIsOpen(true)}
        >
          <PlusCircleIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Transaction
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 flex flex-col h-full md:max-w-[40rem]">
        <header
          className={`py-4 bg-overlay-bg
          border-b border-overlay-border px-6 bg-overlay-bg border-overlay-border flex-shrink-0`}
        >
          <div>
            <h3 className="text-lg font-medium">Adding Senior Citizen</h3>
            <p className="text-xs text-muted-foreground">
              Fill in the details.
            </p>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          <TransactionInputForm form={form} />
        </div>
        <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
          <Button type="submit" disabled={isAddingUser} onClick={form.handleSubmit(onSubmit)} >
            {isAddingUser ? "Creating Senior Citizen..." : "Create Senior Citizen"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default TransactionContentForm

