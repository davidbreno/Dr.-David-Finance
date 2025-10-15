import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AccountRecord, AccountStatus } from "../services/finance";
import { financeService } from "../services/finance";
import { useAuth } from "../providers/AuthProvider";

const accountKeys = {
  all: ["accounts"] as const,
  list: (userId?: string | null) => [...accountKeys.all, userId] as const,
};

export const useAccounts = () => {
  const { user } = useAuth();

  return useQuery<AccountRecord[], Error>({
    queryKey: accountKeys.list(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      return financeService.listAccounts(user.id);
    },
    staleTime: 1000 * 60,
    enabled: Boolean(user?.id),
  });
};

export const useCreateAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      amount: string;
      dueDate: string;
      notes?: string;
      status?: AccountStatus;
    }) => {
      if (!user?.id) throw new Error("Usuario nao autenticado.");
      return financeService.createAccount(user.id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.list(user?.id) });
    },
  });
};

export const useToggleAccountStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AccountStatus }) =>
      financeService.updateAccountStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.list(user?.id) });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (accountId: string) => financeService.deleteAccount(accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.list(user?.id) });
    },
  });
};
