import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import pharmacyService from "../services/pharmacy.service";

const usePharmacies = () => {
  return useQuery({
    queryFn: pharmacyService.getAllPharmacies,
    queryKey: [Q_KEYS.PHARMACY],

    refetchOnWindowFocus: false,
  });
}

export default usePharmacies
