import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import authService from "../service/auth.service";

const useCurrentUser = () => {
  const { isLoading, data: user } = useQuery({
    queryKey: [Q_KEYS.CURRENT_USER],
    queryFn: authService.currentUserHandler,
    refetchOnWindowFocus: false,
  });


  console.log(user)

  return { isLoading, user };
};
export default useCurrentUser;
