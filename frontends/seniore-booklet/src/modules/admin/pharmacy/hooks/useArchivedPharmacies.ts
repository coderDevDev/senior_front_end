import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import pharmacyService from "../services/pharmacy.service";

const useArchivedPharmacies = () => {
  return useQuery({
    queryFn: pharmacyService.getAllPharmacies,
    queryKey: [Q_KEYS.PHARMACY_ARCHIVED],
    refetchOnWindowFocus: false,
  });
}

export default useArchivedPharmacies;
