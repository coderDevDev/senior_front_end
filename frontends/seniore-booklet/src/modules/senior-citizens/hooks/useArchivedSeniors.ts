import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import { getArchivedSeniors } from "../services/senior.service";

const useArchivedSeniors = () => {
  return useQuery({
    queryKey: [Q_KEYS.senior_citizen],
    queryFn: () => getArchivedSeniors(),
    refetchOnWindowFocus: false,
  });
};

export default useArchivedSeniors;
