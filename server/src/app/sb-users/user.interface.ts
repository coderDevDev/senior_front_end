export interface IUser {
  user_id?: Int8Array; // ID assigned by Supabase
  user_uid?: string; // Optional user UID

  firstName: string;
  middleName?: string; // Optional middle name
  lastName: string;
  age: string; // Consider using number for age if appropriate

  userImg?: string; // URL for user image

  email: string; // User's email
  password?: string; // Password (if needed)
  confirmPassword?: string; // Used for validation only, not stored

  isVerified?: boolean; // Verification status
  status?: string; // User status (active, inactive, etc.)
  createdAt?: string; // ISO date string for created date
  updatedAt?: string; // ISO date string for updated date

  userRole: "senior_citizen" | "admin" | "pharmacist"; // User roles
}

export default IUser;
