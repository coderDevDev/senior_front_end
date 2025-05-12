export interface SeniorCitizenFormValues {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  age: number;
  contactNumber: string;
  password?: string;
  address?: string | null;
  birthdate?: string | null;
  birthPlace?: string | null;
  userRole?: string;
  profileImg?: string;
}

// Add any other types/interfaces you need to export
