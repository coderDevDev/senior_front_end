/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import useCreateMedicine from './hooks/useCreateMedicine';
import { useEditMedicine } from './hooks/useEditMedicine';
import MedicineForm from './medicine-form';

export const medicineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  unitPrice: z.coerce.number().min(0, 'Unit price must be a positive number'),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, 'Stock quantity must be a non-negative integer'),
  description: z
    .string({ message: 'Description is required' })
    .min(5, 'Description must contain at least 5 character(s)')
    .max(400, { message: 'Description must only contains 400 characters' })
    .trim(),
  brandName: z
    .string()
    .min(3, 'Brand Name must contain at least 3 character(s)')
    .max(100, { message: 'Brand Name must only contains 100 characters' })
    .trim(),
  genericName: z
    .string()
    .min(3, 'Generic Name must contain at least 3 character(s)')
    .max(100, { message: 'Generic Name must only contains 100 characters' })
    .trim(),
  strength: z
    .string()
    .min(3, 'Strength must contain at least 3 character(s)')
    .max(100, { message: 'Strength must only contains 100 characters' })
    .trim(),
  dosageForm: z
    .string()
    .min(3, 'Dosage Form must contain at least 3 character(s)')
    .max(100, { message: 'Dosage Form must only contains 100 characters' })
    .trim(),
  medicineImageUrl: z.string().optional(),
  medicineImageFile: z.any().optional(),
  prescriptionRequired: z.boolean().optional(),
  isActive: z.boolean().optional()
});

const defaultValues = {
  name: '',
  unitPrice: 0,
  stockQuantity: 0,
  medicineImageFile: undefined,
  strength: '',
  genericName: '',
  dosageForm: '',
  brandName: '',
  description: '',
  prescriptionRequired: false,
  isActive: true
};

export type MedicineFormValues = z.infer<typeof medicineSchema>;

interface MedicineContentFormProps {
  medicine?: Record<string, any>;
  isUpdateMode?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  trigger?: React.ReactNode;
}

const MedicineContentForm = ({
  medicine = {},
  onOpenChange,
  open
}: MedicineContentFormProps) => {
  const { medicineId, ...otherData } = medicine;
  const isEditingMode = Boolean(medicineId);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    mode: 'onTouched',
    defaultValues: isEditingMode && medicine ? { ...otherData } : defaultValues
  });

  const { isAddingMedicine, addMedicineHandler } = useCreateMedicine();
  const { isUpdatingMedicine, updateMedicineHandler } = useEditMedicine();

  useEffect(() => {
    if (open) {
      form.reset(isEditingMode && medicine ? { ...otherData } : defaultValues);
    } else {
      form.reset(defaultValues); // Reset when closing
    }
  }, [open, isEditingMode, medicine, form]);

  const setSheetOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      }
      if (!value) {
        form.reset(defaultValues);
        document.body.style.pointerEvents = 'auto'; // Extra safety
      }
    },
    [onOpenChange, form]
  );

  const onSubmit: SubmitHandler<MedicineFormValues | any> = async (
    data: MedicineFormValues
  ) => {
    try {
      const medicineData = {
        ...data,
        isActive: true,
        isArchived: true,
        medicineId
      };

      if (isEditingMode) {
        await updateMedicineHandler(medicineData);
      } else {
        await addMedicineHandler(medicineData);
      }

      form.reset(defaultValues); // Reset form after submission

      setSheetOpen(false);
    } catch (err) {
      console.error(`[SubmittingError]: ${err}`);
    }
  };

  return (
    <Sheet onOpenChange={setSheetOpen} open={open}>
      <SheetContent className=" p-0 flex flex-col h-full md:max-w-[40rem]">
        <header
          className={`py-4 bg-overlay-bg
              border-b border-overlay-border px-6 bg-overlay-bg border-overlay-border flex-shrink-0`}>
          <div>
            <h3 className="text-lg font-medium"> Medicne Details</h3>
            <p className="text-xs text-muted-foreground">
              Fill in the details to standout your medicne to the Customer.
            </p>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          <MedicineForm form={form} isEditingMode={isEditingMode} />
        </div>

        <SheetFooter className="flex-shrink-0 px-6 py-4 bg-overlay-bg border-t border-overlay-border">
          <Button
            type="submit"
            disabled={isEditingMode ? isUpdatingMedicine : isAddingMedicine}
            onClick={form.handleSubmit(onSubmit)}>
            {isEditingMode
              ? isUpdatingMedicine
                ? 'Updating Medicine.. '
                : 'Update Medicine'
              : isAddingMedicine
              ? 'Creating Medicine...'
              : 'Create Medicine'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MedicineContentForm;
