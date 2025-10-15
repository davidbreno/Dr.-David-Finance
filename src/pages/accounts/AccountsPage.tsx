import { useMemo } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  Clock,
  CreditCard,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
  { label: string; variant: "pending" | "late" | "paid"; action: string }
> = {
  pendente: { label: "Pendente", variant: "pending", action: "Marcar como pago" },
  em_atraso: { label: "Em atraso", variant: "late", action: "Quitar conta" },
  pago: { label: "Pago", variant: "paid", action: "Voltar para pendente" },
};

const SummaryCard = ({
  title,
  subtitle,
  value,
  glow,
}: {
  title: string;
  subtitle: string;
  value: string;
  glow?: "orange" | "green" | "none";
}) => (
  <div className="glass-card flex flex-col gap-2 p-5" data-glow={glow ?? "none"}>
    <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.55)]">
      {subtitle}
    </p>
    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
    <strong className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</strong>
  </div>
);

export const AccountsPage = () => {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const toggleStatus = useToggleAccountStatus();
  const deleteAccount = useDeleteAccount();

  const totalPendentes = useMemo(
    () =>
      accounts
        .filter((account) => account.status !== "pago")
        .reduce((sum, item) => sum + (item.amount ?? 0), 0),
    [accounts],
  );

  const contasEmAtraso = useMemo(
    () => accounts.filter((account) => account.status === "em_atraso"),
    [accounts],
  );

  const upcomingAccounts = useMemo(() => {
    return accounts
      .filter((account) => account.status !== "pago")
      .sort((a, b) => new Date(a.due_date ?? "").getTime() - new Date(b.due_date ?? "").getTime())
      .slice(0, 6);
  }, [accounts]);

  const groupedByStatus = useMemo(
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

  const summaryCards = [
    {
      title: formatCurrency(totalPendentes),
      subtitle: "Total pendente",
      value: `${groupedByStatus.pendente.length} contas`,
      glow: "none" as const,
    },
    {
      title: `${contasEmAtraso.length} contas`,
      subtitle: "Em atraso",
      value: contasEnviado(contasEmAtraso),
      glow: "orange" as const,
    },
    {
      title: `${groupedByStatus.pago.length} contas`,
      subtitle: "Pagas no período",
      value: contasEnviado(groupedByStatus.pago),
      glow: "green" as const,
    },
  ];

  function contasEnviado(list: AccountRecord[]) {
    const total = list.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return total ? formatCurrency(total) : "-";
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Contas a pagar</h1>
        <p className="text-sm text-[rgba(255,255,255,0.55)]">
          Organize vencimentos e acompanhe o status dos pagamentos.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.subtitle} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="glass-card flex flex-col gap-4 p-6" data-glow="orange">
          <header className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(167,112,255,0.18)] text-[var(--color-accent)]">
              <CalendarDays className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Próximos vencimentos
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Contas ordenadas do vencimento mais próximo ao mais distante.
              </p>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="table-neon min-w-full">
              <thead>
                <tr>
                  <th className="pr-6">Conta</th>
                  <th className="pr-6">Vencimento</th>
                  <th className="pr-6">Valor</th>
                  <th className="pr-6">Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-[rgba(255,255,255,0.55)]">
                      Carregando contas...
                    </td>
                  </tr>
                ) : upcomingAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-[rgba(255,255,255,0.55)]">
                      Nenhuma conta pendente.
                    </td>
                  </tr>
                ) : (
                  upcomingAccounts.map((account) => {
                    const cfg = statusConfig[account.status];
                    return (
                      <tr key={account.id}>
                        <td className="pr-6 font-medium text-[var(--color-text-primary)]">{account.title}</td>
                        <td className="pr-6">
                          {account.due_date ? format(new Date(account.due_date), "dd/MM/yyyy") : "-"}
                        </td>
                        <td className="pr-6 text-[var(--color-text-primary)]">{formatCurrency(account.amount ?? 0)}</td>
                        <td className="pr-6">
                          <span className="status-badge" data-variant={cfg.variant}>{cfg.label}</span>
                        </td>
                        <td className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(account)}
                            className="btn btn-ghost h-8 rounded-full px-3 text-xs"
                            title={cfg.action}
                          >
                            {cfg.action}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(account)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-500/15 hover:text-red-500"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="glass-card flex flex-col gap-4 p-6" data-glow="none">
            <header className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(63,221,140,0.18)] text-[#3fdd8c]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Adicionar conta</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Cadastro rápido</p>
              </div>
            </header>
            <TransactionForm kind="saida" onSubmit={handleCreate} isSubmitting={createAccount.isPending} />
          </div>

          <div className="glass-card flex flex-col gap-4 p-6" data-glow="none">
            <header className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,184,76,0.18)] text-[#ffb84c]">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Status geral</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Situação atual</p>
              </div>
            </header>

            <ul className="flex flex-col gap-3 text-sm text-[rgba(255,255,255,0.7)]">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Pendentes</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{groupedByStatus.pendente.length}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><CalendarCheck2 className="h-4 w-4" /> Pagas</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{groupedByStatus.pago.length}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Em atraso</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{contasEmAtraso.length}</span>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AccountsPage;
