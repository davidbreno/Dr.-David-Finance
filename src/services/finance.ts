import { supabase } from "../lib/supabaseClient";
import { parseCurrencyInput } from "../utils/format";

export type TransactionType = "entrada" | "saida";

export type FinanceTransaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string | null;
  date: string;
  notes?: string | null;
  created_at: string;
};

export type AccountStatus = "pendente" | "pago" | "em_atraso";

export type AccountRecord = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  status: AccountStatus;
  due_date: string;
  notes?: string | null;
  created_at: string;
};

export const financeService = {
  async listTransactions(type: TransactionType, userId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data as FinanceTransaction[]) ?? [];
  },

  async createTransaction(
    userId: string,
    payload: {
      type: TransactionType;
      amount: string;
      description: string;
      category: string;
      date: string;
      notes?: string;
    },
  ) {
    const { error, data } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: payload.type,
        amount: parseCurrencyInput(payload.amount),
        description: payload.description,
        category: payload.category,
        date: payload.date,
        notes: payload.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FinanceTransaction;
  },

  async deleteTransaction(transactionId: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", transactionId);
    if (error) throw error;
  },

  async listAccounts(userId: string) {
    const { data, error } = await supabase
      .from("accounts_payable")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return (data as AccountRecord[]) ?? [];
  },

  async createAccount(
    userId: string,
    payload: {
      title: string;
      amount: string;
      dueDate: string;
      notes?: string;
      status?: AccountStatus;
    },
  ) {
    const status = payload.status ?? "pendente";

    const { data, error } = await supabase
      .from("accounts_payable")
      .insert({
        user_id: userId,
        title: payload.title,
        amount: parseCurrencyInput(payload.amount),
        notes: payload.notes ?? null,
        due_date: payload.dueDate,
        status,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AccountRecord;
  },

  async updateAccountStatus(accountId: string, status: AccountStatus) {
    const { data, error } = await supabase
      .from("accounts_payable")
      .update({ status })
      .eq("id", accountId)
      .select()
      .single();

    if (error) throw error;
    return data as AccountRecord;
  },

  async deleteAccount(accountId: string) {
    const { error } = await supabase.from("accounts_payable").delete().eq("id", accountId);
    if (error) throw error;
  },
};
