import { supabase } from "@/config";
import { customReponse, ErrorResponse, SuccessResponse } from "@/utils";
import IMedicine from "./medicine.interface";

export  class MedicineService {

  constructor() { }


  async addMedicine(payload: IMedicine): Promise<SuccessResponse<IMedicine> | ErrorResponse> {
    try {

      // Create Medicine 
      const { data: medicineData, error: medicineErr } = await supabase
        .from("medicine")
        .insert(payload)
        .select()
        .single();

        console.log(medicineErr)


      if(medicineErr) return customReponse<IMedicine>().error(400, this.convertToError(medicineErr), 'Medicine error', 'MedicineError')

      if (!medicineData) return customReponse<IMedicine>().error(500, new Error('Medicine data insertion failed'), 'Database error', 'DatabaseError')


      return customReponse<IMedicine>().success(201, medicineData, 'Medicine created successfully')

    } catch(error) {
      
      console.error('Unexpected error in createUser:', error)
      return customReponse<IMedicine>().error(500, 
        error instanceof Error ? error : 
        new Error('Unknown error'), 
        'An unexpected error occurred', 'UnexpectedError');
    }
  };

  private convertToError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return new Error(String(error.message))
    }

    console.log(error)
    return new Error(String(error))
  }
}


export default MedicineService;
