import { supabase } from "@/config/supabase.config";
import { IMedicalRecord } from "../medicals/medical-record.interface";

export class MedicalRecordService {

  constructor() { }

  async createMedicalRecord(payload: IMedicalRecord): Promise<IMedicalRecord>  {

    const { data, error: medicalRecordError } = await supabase
    .from("medical_records")
    .insert({
      senior_citizen_id: payload.senior_citizen_id,
      diagnosis: payload.diagnosis,
      medication: payload.medication,
      doctor_name: payload.doctor_name,
      hospital_name: payload.hospital_name,
      record_date: payload.record_date
    })
    .select()
    .single();

    if(medicalRecordError) throw  `[MedicalRecordErrorService]: ${JSON.stringify(medicalRecordError, null, 0)}`;

    return data;
  }

  async getMedicalRecords(): Promise<IMedicalRecord[]>  {

    const { data, error: medicalRecordError } = await supabase
    .from("medical_records")
    .select();

    if(medicalRecordError) throw  `[MedicalRecordErrorService]: ${JSON.stringify(medicalRecordError, null, 0)}`;

    return data;
  }

  async getMedicalRecord(medical_record_id: string): Promise<IMedicalRecord | null>  {

    const { data, error: medicalRecordError } = await supabase
    .from("medical_records")
    .select()
    .eq("id", medical_record_id)
    .single();

    if(medicalRecordError) throw  `[MedicalRecordErrorService]: ${JSON.stringify(medicalRecordError, null, 0)}`;

    return data;
  }

  async updateMedicalRecord(medical_record_id: string, payload: IMedicalRecord): Promise<IMedicalRecord>  {

    const { data, error: medicalRecordError } = await supabase
    .from("medical_records")
    .update({
      senior_citizen_id: payload.senior_citizen_id,
      diagnosis: payload.diagnosis,
      medication: payload.medication,
      doctor_name: payload.doctor_name,
      hospital_name: payload.hospital_name,
      record_date: payload.record_date
    })
    .eq("id", medical_record_id)
    .select()
    .single();

    if(medicalRecordError) throw  `[MedicalRecordErrorService]: ${JSON.stringify(medicalRecordError, null, 0)}`;

    return data;
  }

  async deleteMedicalRecord(medical_record_id: string): Promise<void>  {

    const { error: medicalRecordError } = await supabase
    .from("medical_records")
    .delete()
    .eq("id", medical_record_id);

    if(medicalRecordError) throw  `[MedicalRecordErrorService]: ${JSON.stringify(medicalRecordError, null, 0)}`;
  }
}