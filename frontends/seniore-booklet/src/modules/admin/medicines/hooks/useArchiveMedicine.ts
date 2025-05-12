import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import medicineService from "../services/medicine.service";

export const useArchiveMedicine = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: archiveMedicineHandler, isPending } = useMutation({
    mutationFn: medicineService.archiveMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.MEDICINE] });
      toast.success("Medicine archived successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive medicine: ${error.message}`);
    }
  });

  return { archiveMedicineHandler, isPending };
};

export const useUnarchiveMedicine = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: UnarchiveMedicineHandler, isPending } = useMutation({
    mutationFn: medicineService.unarchiveMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.MEDICINE] });
      toast.success("Medicine has been recovered successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to recover medicine: ${error.message}`);
    }
  });

  return { UnarchiveMedicineHandler, isPending };
};
