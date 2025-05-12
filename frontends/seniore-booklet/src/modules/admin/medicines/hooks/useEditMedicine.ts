import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import medicineService from "../services/medicine.service";

export const useEditMedicine = () => {
  const queryClient = useQueryClient();
  
    const { isPending: isUpdatingMedicine, mutateAsync: updateMedicineHandler } = useMutation({
      mutationFn: medicineService.updateMedicine,
      onSuccess: (_newArr, data) => {
        toast.success(
          `Success! The ${(data).name} has been modified successfully. `
        );
        queryClient.invalidateQueries({
          queryKey: [Q_KEYS.MEDICINE],
        });
      },
      onError: (err) => toast.error(err.message),
  
    }) 
  

  return { updateMedicineHandler, isUpdatingMedicine };
};
