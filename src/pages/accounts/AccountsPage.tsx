import { useMemo } from "react";
import { CalendarCheck2, Clock, CreditCard, ShieldCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { TransactionForm } from "../../components/forms/TransactionForm";
import type { TransactionFormValues } from "../../components/forms/TransactionForm";
import {
  useAccounts,
  useCreateAccount,
  useToggleAccountStatus,
  useDeleteAccount,
} from "../../hooks/useAccounts";
import type { AccountRecord } from "../../services/finance";
import { formatCurrency } from "../../utils/format";

const statusConfig: Record<
  AccountRecord["status"],
  { label: string; color: string; action: string }
> = {
  pendente: { label: "Pendente", color: "text-amber-500", action: "Confirmar pagamento" },
  em_atraso: { label: "Em atraso", color: "text-red-500", action: "Marcar como pago" },
  pago: { label: "Pago", color: "text-emerald-500", action: "Voltar para pendente" },
};

const statusOrder: AccountRecord["status"][] = ["pendente", "em_atraso", "pago"];

export const AccountsPage = () => {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const toggleStatus = useToggleAccountStatus();
  const deleteAccount = useDeleteAccount();

  const grouped = useMemo(
    () =>
      accounts.reduce(
        (acc, account) => {
          acc[account.status].push(account);
          return acc;
        },
        {
          pendente: [] as AccountRecord[],
          em_atraso: [] as AccountRecord[],
          pago: [] as AccountRecord[],
        },
      ),
    [accounts],
  );

  const handleCreate = async (values: TransactionFormValues) => {
    await createAccount.mutateAsync({
      title: values.description,
      amount: values.amount,
      dueDate: values.date,
      notes: [values.category, values.notes].filter(Boolean).join(" - ") || undefined,
    });
  };

  const handleToggle = (account: AccountRecord) => {
    const nextStatus =
      account.status === "pago" ? "pendente" : account.status === "pendente" ? "pago" : "pago";

    void toggleStatus.mutateAsync({ id: account.id, status: nextStatus });
  };

  const handleDelete = async (account: AccountRecord) => {
    const shouldDelete = window.confirm("Deseja realmente excluir esta conta?");
    if (!shouldDelete) return;
    await deleteAccount.mutateAsync(account.id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <TransactionForm
        kind="conta"
        onSubmit={handleCreate}
        isSubmitting={createAccount.isPending}
      />

      <aside className="glass-card flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <CalendarCheck2 className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Contas conferidas
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Todas as contas lancadas ficam organizadas por status.
            </p>
          </div>
        </header>

        {createAccount.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {createAccount.error.message ?? "Nao foi possivel registrar a conta."}
          </div>
        )}

        {toggleStatus.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {toggleStatus.error.message ?? "Nao foi possivel atualizar o status."}
          </div>
        )}

        {deleteAccount.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {deleteAccount.error.message ?? "Nao foi possivel excluir a conta."}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-[var(--color-surface-muted)] px-6 py-10 text-center text-sm text-[var(--color-text-muted)]">
            Carregando contas...
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-[var(--color-surface-muted)] px-6 py-10 text-center">
            <CreditCard className="h-10 w-10 text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Registre uma conta na lateral para acompanhar vencimentos e pagamentos.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {statusOrder.map((status) => {
              const Icon =
                status === "pendente" ? Clock : status === "em_atraso" ? CalendarCheck2 : ShieldCheck;
              const accountsByStatus = grouped[status];
              const settings = statusConfig[status];

              if (accountsByStatus.length === 0) return null;

              return (
                <section key={status} className="flex flex-col gap-3">
                  <header className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-[var(--color-text-muted)]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {settings.label}
                    </h3>
                    <span className="ml-auto rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
                      {accountsByStatus.length}
                    </span>
                  </header>

                  <div className="flex flex-col gap-3">
                    {accountsByStatus.map((account) => (
                      <div
                        key={account.id}
                        className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {account.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[var(--color-accent)]">
                              {formatCurrency(account.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(account)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-500/15 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Excluir conta"
                              disabled={deleteAccount.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-[var(--color-text-muted)]">
                            {format(new Date(account.due_date), "dd/MM/yyyy")}
                          </span>
                          <span className={settings.color}>{settings.label}</span>
                        </div>
                        {account.notes && (
                          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                            {account.notes}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggle(account)}
                          className="mt-4 w-full rounded-2xl border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={toggleStatus.isPending}
                        >
                          {settings.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
};

export default AccountsPage;



