import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trash2, TrendingUp } from "lucide-react";

import { TransactionForm } from "../../components/forms/TransactionForm";
import type { TransactionFormValues } from "../../components/forms/TransactionForm";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "../../hooks/useTransactions";
import { aggregateByMonth, aggregateCategories } from "../../utils/analytics";
import { formatCurrency, formatDate } from "../../utils/format";

const donutColors = ["#7367ff", "#ff8a3d", "#20d68f", "#4dd4ff", "#ea5bff", "#ffcf33"];

export const EntriesPage = () => {
  const { data: entries = [], isLoading } = useTransactions("entrada");
  const createEntry = useCreateTransaction("entrada");
  const deleteEntry = useDeleteTransaction("entrada");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEntries = useMemo(
    () =>
      selectedCategory
        ? entries.filter((e) => (e.category ?? "Outros").toUpperCase() === selectedCategory)
        : entries,
    [entries, selectedCategory],
  );

  const monthly = useMemo(
    () =>
      aggregateByMonth(
        filteredEntries.map((item) => ({ amount: item.amount ?? 0, date: item.date })),
        [],
      ),
    [filteredEntries],
  );

  const categories = useMemo(
    () =>
      aggregateCategories(
        entries.map((item) => ({ amount: item.amount ?? 0, category: item.category })),
        [],
      ),
    [entries],
  );

  const entradasPorCategoria = useMemo(
    () =>
      categories
        .map((categoria) => ({ name: categoria.categoria, value: categoria.entradas }))
        .filter((item) => item.value > 0),
    [categories],
  );

  const handleCreateEntry = async (values: TransactionFormValues) => {
    await createEntry.mutateAsync(values);
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Deseja realmente remover esta entrada?");
    if (!shouldDelete) return;
    await deleteEntry.mutateAsync(id);
  };

  const sortedEntries = useMemo(
    () =>
      [...filteredEntries].sort(
        (a, b) => new Date(b.date ?? "").getTime() - new Date(a.date ?? "").getTime(),
      ),
    [filteredEntries],
  );

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Entradas</h1>
        <p className="text-sm text-[rgba(255,255,255,0.55)]">
          Distribuição e evolução das receitas do período.
        </p>
      </header>

      <section className="glass-card flex flex-col gap-6 p-6" data-glow="purple">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Fluxo financeiro
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Entradas e saídas em cada mês.
            </p>
          </div>
        </header>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineEntrada" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7367ff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7367ff" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="lineSaida" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8a3d" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                tickFormatter={(value: number) => formatCurrency(value)}
                width={80}
              />
              <Tooltip
                formatter={(value: number, name) => [
                  formatCurrency(value),
                  name === "entradas" ? "Entradas" : "Saídas",
                ]}
                labelFormatter={(label) => label}
                contentStyle={{
                  background: "rgba(10, 15, 30, 0.92)",
                  borderRadius: "14px",
                  border: "1px solid rgba(120,130,170,0.25)",
                  color: "var(--color-text-primary)",
                }}
              />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke="url(#lineEntrada)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#7367ff" }}
              />
              <Line
                type="monotone"
                dataKey="saidas"
                stroke="url(#lineSaida)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#ff8a3d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
        <div className="glass-card flex flex-col gap-6 p-6" data-glow="orange">
          <header className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(115,103,255,0.18)] text-[#7367ff]">
              <TrendingUp className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Entradas por categoria
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Visualize onde suas receitas se concentram.
              </p>
            </div>
          </header>
          <div className="flex h-64 w-full items-center justify-center">
            {entradasPorCategoria.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip formatter={(value: number) => formatCurrency(value as number)} />
                  <Pie
                    data={entradasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={6}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {entradasPorCategoria.map((slice, idx) => (
                      <Cell
                        key={`entrada-${idx}`}
                        fill={donutColors[idx % donutColors.length]}
                        stroke="var(--color-bg)"
                        strokeWidth={5}
                        onClick={() =>
                          setSelectedCategory((prev) =>
                            prev === slice.name.toUpperCase() ? null : slice.name.toUpperCase(),
                          )
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-sm text-[rgba(255,255,255,0.55)]">Sem dados suficientes.</span>
            )}
          </div>
          {selectedCategory && (
            <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-xs text-[var(--color-text-muted)]">
              <span>
                Filtro por categoria: <strong className="text-[var(--color-text-primary)]">{selectedCategory}</strong>
              </span>
              <button
                type="button"
                className="btn-ghost rounded-xl px-3 py-1 text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        <TransactionForm
          kind="entrada"
          onSubmit={handleCreateEntry}
          isSubmitting={createEntry.isPending}
        />
      </section>

      <section className="glass-card flex flex-col gap-4 p-6" data-glow="none">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Histórico de entradas
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Gerencie e acompanhe as receitas registradas.
            </p>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="table-neon min-w-full">
            <thead>
              <tr>
                <th className="pr-6">Descrição</th>
                <th className="pr-6">Categoria</th>
                <th className="pr-6">Data</th>
                <th className="pr-6">Valor</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-[rgba(255,255,255,0.55)]">
                    Carregando entradas...
                  </td>
                </tr>
              ) : sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-[rgba(255,255,255,0.55)]">
                    Nenhuma entrada registrada ainda.
                  </td>
                </tr>
              ) : (
                sortedEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id}>
                    <td className="pr-6 text-[var(--color-text-primary)] font-medium">
                      {entry.description}
                    </td>
                    <td className="pr-6 text-[rgba(255,255,255,0.65)]">
                      {entry.category ?? "Sem categoria"}
                    </td>
                    <td className="pr-6">{formatDate(entry.date)}</td>
                    <td className="pr-6 text-[var(--color-text-primary)]">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-500/15 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Remover entrada"
                        disabled={deleteEntry.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EntriesPage;
