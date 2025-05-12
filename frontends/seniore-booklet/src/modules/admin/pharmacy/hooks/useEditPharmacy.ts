import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { editPharmacyService } from "../services/edit-pharmacy.service";

export function useEditPharmacy() {
  const queryClient = useQueryClient();

  const { mutate: updatePharmacyHandler, isPending: isUpdatingPharmacy } = useMutation({
     mutationFn:  editPharmacyService.updatePharmacy,
      onSuccess: (_newArr, data) => {
        toast.success(
          `Success! The ${(data).name} has been modified successfully. `
        );
        queryClient.invalidateQueries({
          queryKey: [Q_KEYS.PHARMACY],
        });
      },
      onError: (err) => toast.error(err.message),
  
  });

  return { updatePharmacyHandler, isUpdatingPharmacy };
}
