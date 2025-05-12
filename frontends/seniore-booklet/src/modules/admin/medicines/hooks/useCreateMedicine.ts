import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import medicineService from "../services/medicine.service";


export default function useCreateMedicine() {
    const queryClient = useQueryClient();
  
    const { isPending: isAddingMedicine, mutateAsync: addMedicineHandler } = useMutation({
      mutationFn: medicineService.addMedicine,
      onSuccess: (_newArr, data) => {
        toast.success(
          `Success! The ${(data).name} has been created successfully. `
        );
        queryClient.invalidateQueries({
          queryKey: [Q_KEYS.MEDICINE],
        });
      },
      onError: (err) => toast.error(err.message),
  
    }) 
  
    return { isAddingMedicine, addMedicineHandler}
  
}
