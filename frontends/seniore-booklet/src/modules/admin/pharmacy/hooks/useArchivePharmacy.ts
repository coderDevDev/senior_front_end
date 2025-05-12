import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PharmacyService from "../services/pharmacy.service";

export const useArchivePharmacy = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: archivePharmacyHandler, isPending } = useMutation({
    mutationFn: PharmacyService.archivePharmacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.PHARMACY] });
      toast.success("Pharmacy archived successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive pharmacy: ${error.message}`);
    }
  });

  return { archivePharmacyHandler, isPending };
};

export const useUnarchivePharmacy = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: UnarchivePharmacyHandler, isPending } = useMutation({
    mutationFn: PharmacyService.unarchivePharmacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.PHARMACY] });
      toast.success("Pharmacy has been recovered successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to recover pharmacy: ${error.message}`);
    }
  });

  return { UnarchivePharmacyHandler, isPending };
};
