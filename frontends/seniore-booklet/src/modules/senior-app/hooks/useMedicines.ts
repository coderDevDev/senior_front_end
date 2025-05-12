import { Q_KEYS } from "@/shared/qkeys";
import { useQuery } from "@tanstack/react-query";
import medicineService from "@/modules/admin/medicines/services/medicine.service";

const useMedicines = () => {
  return useQuery({
    queryFn: medicineService.getAllMedicines,
    queryKey: [Q_KEYS.MEDICINE],

    refetchOnWindowFocus: false,
  });
}

export default useMedicines
