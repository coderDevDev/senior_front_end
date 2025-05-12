import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import pharmacyService from "../services/pharmacy.service";


export default function useCreatePharmacy() {
    const queryClient = useQueryClient();
  
    const { isPending: isAddingPharmacy, mutateAsync: addPharmacyHandler } = useMutation({
      mutationFn: pharmacyService.addPharmacy,
      onSuccess: (_newArr, data) => {
        toast.success(
          `Success! The ${(data).name} has been created successfully. `
        );
        queryClient.invalidateQueries({
          queryKey: [Q_KEYS.PHARMACY],
        });
      },
      onError: (err) => toast.error(err.message),
  
    }) 
    return { isAddingPharmacy, addPharmacyHandler}
  
  
}
