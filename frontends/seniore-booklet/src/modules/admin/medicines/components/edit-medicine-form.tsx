import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicineSchema, type MedicineFormValues } from "../medicine-content-form";
import MedicineForm from "../medicine-form";
import { useEditMedicine } from "../hooks/useEditMedicine";
import IMedicine from "../medicine.interface";

interface EditMedicineFormProps {
  medicine: IMedicine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditMedicineForm({ medicine, open, onOpenChange }: EditMedicineFormProps) {
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: medicine.name,
      genericName: medicine.genericName,
      brandName: medicine.brandName,
      description: medicine.description,
      // Add other fields as needed
    }
  });

  const { updateMedicineHandler, isUpdatingMedicine } = useEditMedicine();

  const onSubmit = async (data: MedicineFormValues) => {
    updateMedicineHandler({ medicineId: medicine.medicineId!, data });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Edit Medicine</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto">
          <MedicineForm form={form} />
        </div>
        <SheetFooter className="flex-shrink-0 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isUpdatingMedicine}
          >
            {isUpdatingMedicine ? "Updating..." : "Update Medicine"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
