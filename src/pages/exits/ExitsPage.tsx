import { useMemo } from "react";
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
import { MinusCircle, Trash2 } from "lucide-react";

import { TransactionForm } from "../../components/forms/TransactionForm";
import type { TransactionFormValues } from "../../components/forms/TransactionForm";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
} from "../../hooks/useTransactions";
import { aggregateByMonth, aggregateCategories } from "../../utils/analytics";
import { formatCurrency, formatDate } from "../../utils/format";

const donutColors = ["#ff8a3d", "#7367ff", "#20d68f", "#4dd4ff", "#ea5bff", "#ffcf33"];

export const ExitsPage = () => {
  const { data: exits = [], isLoading } = useTransactions("saida");
  const createExit = useCreateTransaction("saida");
  const deleteExit = useDeleteTransaction("saida");

  const monthly = useMemo(
    () =>
      aggregateByMonth(
        [],
        exits.map((item) => ({ amount: item.amount ?? 0, date: item.date })),
      ),
    [exits],
  );

  const categories = useMemo(
    () =>
      aggregateCategories(
        [],
        exits.map((item) => ({ amount: item.amount ?? 0, category: item.category })),
      ),
    [exits],
  );

  const saidasPorCategoria = useMemo(
    () =>
      categories
        .map((categoria) => ({ name: categoria.categoria, value: categoria.saidas }))
        .filter((item) => item.value > 0),
    [categories],
  );

  const handleCreateExit = async (values: TransactionFormValues) => {
    await createExit.mutateAsync(values);
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Deseja realmente remover esta saída?");
    if (!shouldDelete) return;
    await deleteExit.mutateAsync(id);
  };

  const sortedExits = useMemo(
    () =>
      [...exits].sort(
        (a, b) => new Date(b.date ?? "").getTime() - new Date(a.date ?? "").getTime(),
      ),
    [exits],
  );

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Saídas</h1>
        <p className="text-sm text-[rgba(255,255,255,0.55)]">
          Gastos monitorados por categoria e vencimento.
        </p>
      </header>

      <section className="glass-card flex flex-col gap-6 p-6" data-glow="orange">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Fluxo financeiro
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Evolução das saídas ao longo dos meses.
            </p>
          </div>
        </header>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineSaidaMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8a3d" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="lineSaidaAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7367ff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7367ff" stopOpacity={0.05} />
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
                formatter={(value: number) => formatCurrency(value)}
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
                dataKey="saidas"
                stroke="url(#lineSaidaMain)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#ff8a3d" }}
              />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke="url(#lineSaidaAlt)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#7367ff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
        <div className="glass-card flex flex-col gap-6 p-6" data-glow="orange">
          <header className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,138,61,0.18)] text-[#ff8a3d]">
              <MinusCircle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Saídas por categoria
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Distribuição dos gastos e assinaturas.
              </p>
            </div>
          </header>
          <div className="flex h-64 w-full items-center justify-center">
            {saidasPorCategoria.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip formatter={(value: number) => formatCurrency(value as number)} />
                  <Pie
                    data={saidasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={6}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {saidasPorCategoria.map((_, idx) => (
                      <Cell
                        key={`saida-${idx}`}
                        fill={donutColors[idx % donutColors.length]}
                        stroke="var(--color-bg)"
                        strokeWidth={5}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-sm text-[rgba(255,255,255,0.55)]">Sem dados suficientes.</span>
            )}
          </div>
        </div>

        <TransactionForm
          kind="saida"
          onSubmit={handleCreateExit}
          isSubmitting={createExit.isPending}
        />
      </section>

      <section className="glass-card flex flex-col gap-4 p-6" data-glow="none">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Histórico de saídas
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Acompanhe gastos recentes e mantenha seu orçamento em dia.
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
                    Carregando saídas...
                  </td>
                </tr>
              ) : sortedExits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-[rgba(255,255,255,0.55)]">
                    Nenhuma saída registrada ainda.
                  </td>
                </tr>
              ) : (
                sortedExits.slice(0, 10).map((exit) => (
                  <tr key={exit.id}>
                    <td className="pr-6 text-[var(--color-text-primary)] font-medium">
                      {exit.description}
                    </td>
                    <td className="pr-6 text-[rgba(255,255,255,0.65)]">
                      {exit.category ?? "Sem categoria"}
                    </td>
                    <td className="pr-6">{formatDate(exit.date)}</td>
                    <td className="pr-6 text-[#ff8a3d]">- {formatCurrency(exit.amount)}</td>
                    <td className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(exit.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-500/15 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Remover saída"
                        disabled={deleteExit.isPending}
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

export default ExitsPage;
