export default interface ISeniorCitizen {
  id: string;

  firstName: string;
  lastName: string;
  middleName?: string;
  address: string;
  userImg?: string;
  profileImg: string;
  age?: string;
  healthStatus: string;
  emergencyContact?: string;
  contactNumber?: string;
  email: string;
  password: string;
  confirmPassword: string;

  createdAt: string;
  updatedAt: string;

  userRole?: string;
  status?: string; // Add this line for archive status
}
