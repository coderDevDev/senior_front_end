export interface IPharmacy {
  // Unique identifier for each pharmacy
  pharmacyId?: string;

  // The name of the pharmacy
  name?: string;

  // The physical location of the pharmacy
  address?: string;

  // Contact number for the pharmacy
  phoneNumber?: string;

  // Email address for the pharmacy
  email?: string;

  // The hours during which the pharmacy is open
  operatingHours?: string;

  // Boolean to indicate if the pharmacy is open 24/7
  is24Hours?: boolean;

  // Image for the Phamarcy
  pharmacyImg?: string;

  // Status
  status?: string;

  created_at?: string;
  updated_at?: string;
}


export default IPharmacy;
