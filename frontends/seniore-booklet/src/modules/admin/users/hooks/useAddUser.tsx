 
import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addUser } from "../services/user.service";

export function useAddUser() {
  const queryClient = useQueryClient();

  const { isPending: isAddingUser, mutateAsync: createUser } = useMutation({
    mutationFn: addUser,
    onSuccess: (_newArr, data) => {
      toast.success(
        `Success! The ${(data).email} has been created successfully. `
      );
      queryClient.invalidateQueries({
        queryKey: [Q_KEYS.USERS],
      });
    },
    onError: (err) => toast.error(err.message),

  }) 

  return { isAddingUser, createUser}
}
