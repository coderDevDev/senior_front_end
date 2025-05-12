import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import { getAllTransactions } from "../services/user.transaction.service";

export const useTransactions = () => {
  return useQuery({
    queryFn: getAllTransactions,
    queryKey: [Q_KEYS.USERS],

    refetchOnWindowFocus: false,
  });
};
