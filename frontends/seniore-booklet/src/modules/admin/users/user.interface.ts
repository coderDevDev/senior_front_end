export default interface IUser {
  id: string; 


  user_id?: string;


  firstName: string;
  lastName: string;
  middleName?: string;
  address: string;
  emergencyContacts: IEmergencyContact;
  userImg?: string | File;

  email: string;
  password: string;
  confirmPassword: string;

  createdAt: string;
  updatedAt: string;

  userRole?: string;

  status?: string;
}

interface IEmergencyContact {
  name: string;
  contactNumber: number;
}
