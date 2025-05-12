import { supabase } from "@/config/supabase.config"
import type { ITransaction } from "./transaction.interface"

export class TransactionService {
  constructor() {}

  async createTransaction(payload: ITransaction): Promise<ITransaction> {
    const { data, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        senior_citizen_id: payload.senior_citizen_id,
        pharmacy_id: payload.pharmacy_id,
        transaction_date: payload.transaction_date,
        total_amount: payload.total_amount,
        discounted_amount: payload.discounted_amount,
        payment_method: payload.payment_method,
      })
      .select()
      .single()

    if (transactionError) throw `[TransactionErrorService]: ${JSON.stringify(transactionError, null, 0)}`

    return data
  }

  async getTransactions(): Promise<ITransaction[]> {
    const { data, error: transactionError } = await supabase.from("transactions").select()

    if (transactionError) throw `[TransactionErrorService]: ${JSON.stringify(transactionError, null, 0)}`

    return data
  }

  async getTransactionById(transaction_id: string): Promise<ITransaction | null> {
    const { data, error: transactionError } = await supabase
      .from("transactions")
      .select()
      .eq("id", transaction_id)
      .single()

    if (transactionError) throw `[TransactionErrorService]: ${JSON.stringify(transactionError, null, 0)}`

    return data
  }

  async updateTransaction(transaction_id: string, payload: Partial<ITransaction>): Promise<ITransaction> {
    const { data, error: transactionError } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", transaction_id)
      .select()
      .single()

    if (transactionError) throw `[TransactionErrorService]: ${JSON.stringify(transactionError, null, 0)}`

    return data
  }

  async deleteTransaction(transaction_id: string): Promise<void> {
    const { error: transactionError } = await supabase.from("transactions").delete().eq("id", transaction_id)

    if (transactionError) throw `[TransactionErrorService]: ${JSON.stringify(transactionError, null, 0)}`
  }
}

export default TransactionService

