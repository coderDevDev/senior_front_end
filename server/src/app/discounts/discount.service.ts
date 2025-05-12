import { supabase } from "@/config/supabase.config";
import { IDiscount } from "../discounts/discount.interface";

export class DiscountService {

  constructor() { }

  async createDiscount(payload: IDiscount): Promise<IDiscount>  {

    const { data, error: discountError } = await supabase
    .from("discounts")
    .insert({
      medicine_id: payload.medicine_id,
      discount_percentage: payload.discount_percentage,
      start_date: payload.start_date,
      end_date: payload.end_date,
      is_active: payload.is_active
    })
    .select()
    .single();

    if(discountError) throw  `[DiscountErrorService]: ${JSON.stringify(discountError, null, 0)}`;

    return data;
  }

  async getDiscounts(): Promise<IDiscount[]>  {

    const { data, error: discountError } = await supabase
    .from("discounts")
    .select();

    if(discountError) throw  `[DiscountErrorService]: ${JSON.stringify(discountError, null, 0)}`;

    return data;
  }

  async getDiscount(discount_id: string): Promise<IDiscount | null>  {

    const { data, error: discountError } = await supabase
    .from("discounts")
    .select()
    .eq("id", discount_id)
    .single();

    if(discountError) throw  `[DiscountErrorService]: ${JSON.stringify(discountError, null, 0)}`;

    return data;
  }

  async updateDiscount(discount_id: string, payload: IDiscount): Promise<IDiscount>  {

    const { data, error: discountError } = await supabase
    .from("discounts")
    .update({
      medicine_id: payload.medicine_id,
      discount_percentage: payload.discount_percentage,
      start_date: payload.start_date,
      end_date: payload.end_date,
      is_active: payload.is_active
    })
    .eq("id", discount_id)
    .select()
    .single();

    if(discountError) throw  `[DiscountErrorService]: ${JSON.stringify(discountError, null, 0)}`;

    return data;
  }

  async deleteDiscount(discount_id: string): Promise<void>  {

    const { error: discountError } = await supabase
    .from("discounts")
    .delete()
    .eq("id", discount_id);

    if(discountError) throw  `[DiscountErrorService]: ${JSON.stringify(discountError, null, 0)}`;
  }
}