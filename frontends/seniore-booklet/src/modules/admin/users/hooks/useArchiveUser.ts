import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { archiveUserStatus, unarchiveUser } from "../services/user.service";

export const useArchiveUser = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: archiveUserHandler, isPending } = useMutation({
    mutationFn: archiveUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.USERS] });
      toast.success("User archived successfully");
    },
    
    onError: (error: Error) => {
      toast.error(`Failed to archive user: ${error.message}`);
    }
  });

  return { archiveUserHandler , isPending};
};


export const useUnarchiveUser = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: UnarchiveUserHandler, isPending } = useMutation({
    mutationFn: unarchiveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.USERS] });
      toast.success("User has been recovered successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to recover user: ${error.message}`);
    }
  });

  return { UnarchiveUserHandler , isPending};
};
