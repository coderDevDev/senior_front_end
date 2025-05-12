

export interface IMedicine {
  status: string;
  medicineId?: string;
  name?: string;
  description?: string;
  unitPrice?: number;

  stockQuantity?: number;

  // The non-proprietary name of the active ingredient.
  brandName?: string;

  // The commercial name of the medicine.
  genericName?: string;

  // Image for Medicine
  medicineImageFile?: File;
  medicineImageUrl?: string;

  // Indicates if the medicine needs a prescription.
  prescriptionRequired?: boolean;


  // The form in which the medicine is administered. (e.g., tablet, capsule, syrup)
  dosageForm?: string;

  // The amount of active ingredient in each unit.  (e.g., 500mg, 50mg/5ml)
  strength?: string




  // Indicates if the medicine is currently available for sale.
  isActive?: boolean;


  created_at?: string;
  updated_at?: string;

}

export default IMedicine;
