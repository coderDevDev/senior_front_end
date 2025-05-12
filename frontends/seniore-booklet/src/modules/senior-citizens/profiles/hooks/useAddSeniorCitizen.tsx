import { Q_KEYS } from "@/shared/qkeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addSeniorCitizen } from "../services/user.service";

export const useAddSeniorCitizen = () => {
  const queryClient = useQueryClient();

  const { isPending: isAddingUser, mutateAsync: createUser } = useMutation({
    mutationFn: addSeniorCitizen,
    onSuccess: (_newArr, data) => {
      toast.success(
        `Success! The ${(data).email} has been created successfully. `
      );
      queryClient.invalidateQueries({
        queryKey: [Q_KEYS.senior_citizen],
      });
    },
    onError: (err) => toast.error(err.message),

  })

  return { isAddingUser, createUser }
}
