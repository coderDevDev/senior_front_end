import { supabase } from "@/config/supabase.config";
import { ITransactionItem } from "../transactions/transaction-item.interface";

export class TransactionItemService {

  constructor() { }

  async createTransactionItem(payload: ITransactionItem): Promise<ITransactionItem>  {

    const { data, error: transactionItemError } = await supabase
    .from("transaction_items")
    .insert({
      transaction_id: payload.transaction_id,
      medicine_id: payload.medicine_id,
      quantity: payload.quantity,
      unit_price: payload.unit_price,
      discount_applied: payload.discount_applied,
      subtotal: payload.subtotal
    })
    .select()
    .single();

    if(transactionItemError) throw  `[TransactionItemErrorService]: ${JSON.stringify(transactionItemError, null, 0)}`;

    return data;
  }

  async getTransactionItems(): Promise<ITransactionItem[]>  {

    const { data, error: transactionItemError } = await supabase
    .from("transaction_items")
    .select();

    if(transactionItemError) throw  `[TransactionItemErrorService]: ${JSON.stringify(transactionItemError, null, 0)}`;

    return data;
  }

  async getTransactionItem(transaction_item_id: string): Promise<ITransactionItem | null>  {

    const { data, error: transactionItemError } = await supabase
    .from("transaction_items")
    .select()
    .eq("id", transaction_item_id)
    .single();

    if(transactionItemError) throw  `[TransactionItemErrorService]: ${JSON.stringify(transactionItemError, null, 0)}`;

    return data;
  }

  async updateTransactionItem(transaction_item_id: string, payload: ITransactionItem): Promise<ITransactionItem>  {

    const { data, error: transactionItemError } = await supabase
    .from("transaction_items")
    .update({
      transaction_id: payload.transaction_id,
      medicine_id: payload.medicine_id,
      quantity: payload.quantity,
      unit_price: payload.unit_price,
      discount_applied: payload.discount_applied,
      subtotal: payload.subtotal
    })
    .eq("id", transaction_item_id)
    .select()
    .single();

    if(transactionItemError) throw  `[TransactionItemErrorService]: ${JSON.stringify(transactionItemError, null, 0)}`;

    return data;
  }

  async deleteTransactionItem(transaction_item_id: string): Promise<void>  {

    const { error: transactionItemError } = await supabase
    .from("transaction_items")
    .delete()
    .eq("id", transaction_item_id);

    if(transactionItemError) throw  `[TransactionItemErrorService]: ${JSON.stringify(transactionItemError, null, 0)}`;
  }
}