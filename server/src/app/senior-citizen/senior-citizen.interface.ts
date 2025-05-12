import { IUser } from "../sb-users/user.interface";

export default interface ISeniorCitizen extends IUser {
  id?: string; // ID assigned by Supabase

  // Senior-specific information
  address?: string;
  birthdate?: string; // Use ISO format (YYYY-MM-DD) for dates
  birthPlace?: string;
  contactNumber?: string;

  // Additional status flags
  isEmailVerified?: boolean;
  isActive?: boolean;

  // Supabase timestamps (created and updated as ISO strings)
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}


