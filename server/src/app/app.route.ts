import { Application } from "express"
import { MedicineRoute } from "./medicines/medicine.route"
import { PharmacyRoute } from "./pharmacy/phamarcy.route"
import { SbUserRoute } from "./sb-users"
import { SeniorCitizenRoute } from "./senior-citizen/senior-citizen.route"
import { TransactionRoute } from "./transactions"
const API_VERSIONING_ENDPOINTS = `/api/v1`


export const router = async (app: Application) => {
  // NOTE: This endpoints below is from firebase API
  // app.use(`${API_VERSIONING_ENDPOINTS}/user`, UserRoute)


  // NOTE: Use this api instead (supabase implementation)
  app.use(`${API_VERSIONING_ENDPOINTS}/user`, SbUserRoute)
  app.use(`${API_VERSIONING_ENDPOINTS}/pharmacy`, PharmacyRoute)
  app.use(`${API_VERSIONING_ENDPOINTS}/medicine`, MedicineRoute)
  app.use(`${API_VERSIONING_ENDPOINTS}/senior`, SeniorCitizenRoute);
  app.use(`${API_VERSIONING_ENDPOINTS}/transaction`, TransactionRoute);
}
