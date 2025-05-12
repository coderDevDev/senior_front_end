import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import medicineService from "../services/medicine.service";

export default function useArchivedMedicines() {
  return useQuery({
    queryKey: [Q_KEYS.MEDICINES_ARCHIVED],
    queryFn: medicineService.getAllMedicines,
    refetchOnWindowFocus: false,
  });
}
