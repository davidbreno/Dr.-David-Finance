import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FinanceTransaction, TransactionType } from "../services/finance";
import { financeService } from "../services/finance";
import { useAuth } from "../providers/AuthProvider";

const transactionKeys = {
  all: ["transactions"] as const,
  list: (type: TransactionType, userId?: string | null) =>
    [...transactionKeys.all, type, userId] as const,
};

export const useTransactions = (type: TransactionType) => {
  const { user } = useAuth();

  return useQuery<FinanceTransaction[], Error>({
    queryKey: transactionKeys.list(type, user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      return financeService.listTransactions(type, user.id);
    },
    staleTime: 1000 * 60,
    enabled: Boolean(user?.id),
  });
};

export const useCreateTransaction = (type: TransactionType) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      amount: string;
      description: string;
      category: string;
      date: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error("Usuario nao autenticado.");
      return financeService.createTransaction(user.id, { ...input, type });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: transactionKeys.list(type, user?.id),
      });
    },
  });
};

export const useDeleteTransaction = (type: TransactionType) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) =>
      financeService.deleteTransaction(transactionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: transactionKeys.list(type, user?.id),
      });
    },
  });
};

