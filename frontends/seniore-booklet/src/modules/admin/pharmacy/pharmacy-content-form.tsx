/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import useCreatePharmacy from "./hooks/useCreatePharmacy";
import { useEditPharmacy } from "./hooks/useEditPharmacy";
import PharmacyForm from "./pharmacy-form";

export const pharmacySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  address: z.string({ message: "Address is required" }).min(5, "Address must contain at least 5 character(s)").max(200).trim(),
  pharmacyImg:  z.any().optional(),

  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email(),
  operatingHours: z.string().min(1).max(100).optional(),
  is24Hours: z.boolean().optional(),
});

const defaultValues = {
  name: "",
  address: "",
  pharmacyImg: undefined,
  phoneNumber: "",
  email: "",
  operatingHours: "",
  is24Hours: false,
}

export type PharmacyFormValues = z.infer<typeof pharmacySchema>;

interface PharmacyContentFormProps {
  pharmacy?: Record<string, any>
  isUpdateMode?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  trigger?: React.ReactNode
}


const PharmacyContentForm = ({ pharmacy = {}, onOpenChange, open }: PharmacyContentFormProps) => {
  const { pharmacy_id, ...otherData } = pharmacy;
  const isEditingMode = Boolean(pharmacy_id);

  console.log(otherData)
  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacySchema),
    mode: "onTouched",
    defaultValues: isEditingMode && pharmacy
    ? { ...otherData, }
    : defaultValues,
  });


  const { isAddingPharmacy, addPharmacyHandler } = useCreatePharmacy();
  const { isUpdatingPharmacy, updatePharmacyHandler } = useEditPharmacy();


  useEffect(() => {
      if (open) {
        form.reset(
          isEditingMode && pharmacy
            ? { ...otherData  }
            : defaultValues
        );
      } else {
        form.reset(defaultValues); // Reset when closing
      }
    }, [open, isEditingMode, pharmacy, form]);
  
    const setSheetOpen = useCallback(
      (value: boolean) => {
        if (onOpenChange) {
          onOpenChange(value);
        }
        if (!value) {
          form.reset(defaultValues);
          document.body.style.pointerEvents = "auto"; // Extra safety
        }
      },
      [onOpenChange, form]
    );
  


   
  const onSubmit: SubmitHandler<PharmacyFormValues | any> = async (data: PharmacyFormValues) => {
    try {
      const pharmacyData = {
        ...data,
        pharmacy_id
      }


      // console.log(pharmacyData)

      if (isEditingMode) {
        await updatePharmacyHandler(pharmacyData)
      } else {
        await addPharmacyHandler(pharmacyData)
      }


      form.reset(defaultValues); // Reset form after submission

      setSheetOpen(false);




      console.log(form.getValues())

    } catch (err) {
      console.error(`[SubmittingError]: ${err}`)
    }


  }

  return (
    <Sheet onOpenChange={setSheetOpen} open={open}>
      <SheetContent className=" p-0 flex flex-col h-full md:max-w-[40rem]">
        <header
          className={`py-4 bg-overlay-bg
              border-b border-overlay-border px-6 bg-overlay-bg border-overlay-border flex-shrink-0`}
        >
          <div>
            <h3 className="text-lg font-medium">Create Pharmacy</h3>
            <p className="text-xs text-muted-foreground">
              Fill in the details to standout your pharmacy to the Customer.
            </p>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          <PharmacyForm form={form} />
        </div>

        <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
        <Button
            type="submit"
            disabled={isEditingMode ? isUpdatingPharmacy : isAddingPharmacy}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isEditingMode
              ? isUpdatingPharmacy ? "Updating Pharmacy.. " : "Update Pharmacy" 
              : isAddingPharmacy
                ? "Creating Pharmacy..."
                : "Create Pharmacy"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default PharmacyContentForm
