export interface IMedicalRecord {
    id: string;
    senior_citizen_id: string;
    diagnosis: string;
    medication: string;
    doctor_name: string;
    hospital_name: string;
    record_date: Date;
    created_at: Date;
    updated_at: Date;
  }