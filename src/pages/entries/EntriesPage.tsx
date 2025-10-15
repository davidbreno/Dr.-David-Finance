import { CheckCircle2, Trash2, TrendingUp } from "lucide-react";

import { TransactionForm } from "../../components/forms/TransactionForm";
import type { TransactionFormValues } from "../../components/forms/TransactionForm";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "../../hooks/useTransactions";
import { formatCurrency, formatDate } from "../../utils/format";

export const EntriesPage = () => {
  const { data: entries = [], isLoading } = useTransactions("entrada");
  const createEntry = useCreateTransaction("entrada");
  const deleteEntry = useDeleteTransaction("entrada");

  const handleCreateEntry = async (values: TransactionFormValues) => {
    await createEntry.mutateAsync(values);
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Deseja realmente remover esta entrada?");
    if (!shouldDelete) return;
    await deleteEntry.mutateAsync(id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
      <TransactionForm
        kind="entrada"
        onSubmit={handleCreateEntry}
        isSubmitting={createEntry.isPending}
      />

      <aside className="glass-card flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <TrendingUp className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Ultimas entradas
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Registros recentes ficam disponiveis aqui.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {createEntry.error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {createEntry.error.message ?? "Nao foi possivel registrar a entrada."}
            </div>
          )}

          {isLoading && (
            <div className="rounded-3xl bg-[var(--color-surface-muted)] px-5 py-6 text-center text-sm text-[var(--color-text-muted)]">
              Carregando entradas...
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="rounded-3xl bg-[var(--color-surface-muted)] px-5 py-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Nenhuma entrada registrada ainda. Preencha o formulario ao lado para comecar.
              </p>
            </div>
          )}

          {entries.slice(0, 6).map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {entry.description}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-accent)]">
                    {formatCurrency(entry.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-500/15 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                    title="Remover entrada"
                    disabled={deleteEntry.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>{formatDate(entry.date)}</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Registrado
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default EntriesPage;
