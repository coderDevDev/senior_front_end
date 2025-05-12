import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import { getAllSeniorCitizens } from "../services/user.service";

const useReadSeniorCitizens = () => {
  return useQuery({
    queryFn: getAllSeniorCitizens,
    queryKey: [Q_KEYS.senior_citizen],

    refetchOnWindowFocus: false,
  });
};

export default useReadSeniorCitizens;
