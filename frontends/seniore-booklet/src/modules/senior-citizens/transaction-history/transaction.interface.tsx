export default interface ITransaction {
  user_id: string;
  senior_citizen_id: string;
  pharmacy_id: string;
  transaction_date: Date;
  total_amount: number;
  discounted_amount: number;
  payment_method: string;
  created_at: Date;
  updated_at: Date;
}