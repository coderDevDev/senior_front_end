import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../services/user.service";

const useReadUsers = () => {
    return useQuery({
      queryFn: getAllUsers,
      queryKey: [Q_KEYS.USERS],
  
      refetchOnWindowFocus: false,
    });
}

export default useReadUsers
