import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUser } from "../services/user.service";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const { mutate: updateUserHandler, isPending: isUpdatingUser } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Q_KEYS.USERS] });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error updating user: ${error.message}`);
    }
  });

  return { updateUserHandler, isUpdatingUser };
};
