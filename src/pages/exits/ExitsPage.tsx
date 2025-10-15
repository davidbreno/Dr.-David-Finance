import { ArrowDownCircle, AlertTriangle, Trash2 } from "lucide-react";

import { TransactionForm } from "../../components/forms/TransactionForm";
import type { TransactionFormValues } from "../../components/forms/TransactionForm";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
} from "../../hooks/useTransactions";
import { formatCurrency, formatDate } from "../../utils/format";

export const ExitsPage = () => {
  const { data: exits = [], isLoading } = useTransactions("saida");
  const createExit = useCreateTransaction("saida");
  const deleteExit = useDeleteTransaction("saida");

  const handleCreateExit = async (values: TransactionFormValues) => {
    await createExit.mutateAsync(values);
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Deseja realmente remover esta saida?");
    if (!shouldDelete) return;
    await deleteExit.mutateAsync(id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
      <TransactionForm
        kind="saida"
        onSubmit={handleCreateExit}
        isSubmitting={createExit.isPending}
      />

      <aside className="glass-card flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[#f55f6f]">
            <ArrowDownCircle className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Saidas recentes
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Acompanhe os gastos mais recentes para manter o caixa saudavel.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {createExit.error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {createExit.error.message ?? "Nao foi possivel registrar a saida."}
            </div>
          )}

          {isLoading && (
            <div className="rounded-3xl bg-[var(--color-surface-muted)] px-5 py-6 text-center text-sm text-[var(--color-text-muted)]">
              Carregando saidas...
            </div>
          )}

          {!isLoading && exits.length === 0 && (
            <div className="rounded-3xl bg-[var(--color-surface-muted)] px-5 py-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Nenhuma saida registrada ainda. Preencha o formulario ao lado para controlar os
                gastos.
              </p>
            </div>
          )}

          {exits.slice(0, 6).map((exit) => (
            <div
              key={exit.id}
              className="flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {exit.description}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#f55f6f]">
                    - {formatCurrency(exit.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(exit.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-500/15 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                    title="Remover saida"
                    disabled={deleteExit.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>{formatDate(exit.date)}</span>
                <span className="inline-flex items-center gap-1 font-medium text-[#f55f6f]">
                  <AlertTriangle className="h-4 w-4" />
                  Monitorar
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default ExitsPage;
