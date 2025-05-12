export default interface IUser {
  status: string;
  id: string;

  firstName: string;
  lastName: string;
  middleName?: string;
  address: string;
  emergencyContacts: IEmergencyContact;
  userImg?: string;

  email: string;
  password: string;
  confirmPassword: string;

  createdAt: string;
  updatedAt: string;

  userRole?: string;
}

interface IEmergencyContact {
  name: string;
  contactNumber: number;
}
