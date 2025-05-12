import { supabase } from "@/config";
import IPharmacy from "./phamarcy.interface";

export class PharmacyService {


  constructor() { }

  async createPharmacy(payload: IPharmacy) {
    const { data, error: pharmacyError } = await supabase
    .from("pharmacy")
    .insert(payload)
    .select()
    .single();
    

    if(pharmacyError) throw `[PharmacyErrorService]: ${JSON.stringify(pharmacyError, null, 0)}`;

    return data;
  }
}

export default PharmacyService;
