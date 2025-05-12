export interface ITransactionItem {
    id: string;
    transaction_id: string;
    medicine_id: string;
    quantity: number;
    unit_price: number;
    discount_applied: number;
    subtotal: number;
    created_at: Date;
    updated_at: Date;
  }