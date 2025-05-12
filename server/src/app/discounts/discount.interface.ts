export interface IDiscount {
    id: string;
    medicine_id: string;
    discount_percentage: number;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }