import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, LineChart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useTransactions } from "../../hooks/useTransactions";
import { formatCurrency } from "../../utils/format";

type Period = "semanal" | "mensal";

type AggregatedRow = {
  chave: string;
  entradas: number;
  saidas: number;
  saldo: number;
};

const groupByCategory = (rows: AggregatedRow[]) =>
  rows.sort((a, b) => b.saldo - a.saldo);

const aggregateTransactions = (params: {
  entries: Array<{ category: string; amount: number; date: string }>;
  exits: Array<{ category: string; amount: number; date: string }>;
  period: Period;
}) => {
  const { entries, exits, period } = params;

  const filterByPeriod = (date: string) => {
    const current = new Date(date);
    const now = new Date();

    if (period === "semanal") {
      const diff = Math.abs(now.getTime() - current.getTime());
      const diffInDays = diff / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    }

    return current.getMonth() === now.getMonth() && current.getFullYear() === now.getFullYear();
  };

  const map = new Map<string, AggregatedRow>();

  entries
    .filter((item) => filterByPeriod(item.date))
    .forEach((item) => {
      const key = item.category || "Outros";
      const row = map.get(key) ?? { chave: key, entradas: 0, saidas: 0, saldo: 0 };
      row.entradas += item.amount;
      row.saldo = row.entradas - row.saidas;
      map.set(key, row);
    });

  exits
    .filter((item) => filterByPeriod(item.date))
    .forEach((item) => {
      const key = item.category || "Outros";
      const row = map.get(key) ?? { chave: key, entradas: 0, saidas: 0, saldo: 0 };
      row.saidas += item.amount;
      row.saldo = row.entradas - row.saidas;
      map.set(key, row);
    });

  return groupByCategory(Array.from(map.values()));
};

export const ReportsPage = () => {
  const [period, setPeriod] = useState<Period>("semanal");

  const { data: entries = [], isLoading: loadingEntries } = useTransactions("entrada");
  const { data: exits = [], isLoading: loadingExits } = useTransactions("saida");

  const aggregated = useMemo(
    () =>
      aggregateTransactions({
        entries: entries.map((entry) => ({
          category: entry.category ?? "Entradas",
          amount: entry.amount ?? 0,
          date: entry.date,
        })),
        exits: exits.map((exit) => ({
          category: exit.category ?? "Saidas",
          amount: exit.amount ?? 0,
          date: exit.date,
        })),
        period,
      }),
    [entries, exits, period],
  );

  const totals = useMemo(() => {
    const totalEntradas = aggregated.reduce((sum, row) => sum + row.entradas, 0);
    const totalSaidas = aggregated.reduce((sum, row) => sum + row.saidas, 0);
    return {
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldo: totalEntradas - totalSaidas,
    };
  }, [aggregated]);

  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Finance David - Relatorio Financeiro", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${today}`, 14, 30);
    doc.text(
      `Periodo: ${period === "semanal" ? "Semana atual" : "Ultimo mes"}`,
      14,
      38,
    );

    autoTable(doc, {
      startY: 48,
      head: [["Categoria", "Entradas", "Saidas", "Saldo"]],
      body: aggregated.map((row) => [
        row.chave,
        formatCurrency(row.entradas),
        formatCurrency(row.saidas),
        formatCurrency(row.saldo),
      ]),
      theme: "grid",
      styles: { font: "helvetica", fontSize: 11 },
      headStyles: { fillColor: [111, 59, 245], halign: "left" },
    });

    const summaryY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont("helvetica", "bold");
    doc.text("Resumo", 14, summaryY);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de entradas: ${formatCurrency(totals.entradas)}`, 14, summaryY + 8);
    doc.text(`Total de saidas: ${formatCurrency(totals.saidas)}`, 14, summaryY + 16);
    doc.text(`Saldo: ${formatCurrency(totals.saldo)}`, 14, summaryY + 24);

    doc.save(`relatorio-${period}-${Date.now()}.pdf`);
  };

  const isLoading = loadingEntries || loadingExits;

  return (
    <div className="grid gap-6">
      <section className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <LineChart className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Relatorios inteligentes
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Gere um PDF com o resumo financeiro semanal ou mensal.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-full bg-[var(--color-surface-muted)] p-1">
            <FilterChip isActive={period === "semanal"} onClick={() => setPeriod("semanal")}>
              Relatorio semanal
            </FilterChip>
            <FilterChip isActive={period === "mensal"} onClick={() => setPeriod("mensal")}>
              Relatorio mensal
            </FilterChip>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={aggregated.length === 0}
            className="flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="glass-card p-6">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Demonstrativo {period === "semanal" ? "semanal" : "mensal"}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Valores consolidados das movimentacoes registradas.
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
              Atualizado {format(new Date(), "dd/MM/yyyy")}
            </span>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl bg-[var(--color-surface-muted)] px-6 py-12 text-sm text-[var(--color-text-muted)]">
              Carregando movimentacoes...
            </div>
          ) : aggregated.length === 0 ? (
            <div className="flex items-center justify-center rounded-3xl bg-[var(--color-surface-muted)] px-6 py-12 text-sm text-[var(--color-text-muted)]">
              Nenhum lancamento registrado no periodo selecionado.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Categoria
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Entradas
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Saidas
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                  {aggregated.map((row) => (
                    <tr key={row.chave}>
                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">
                        {row.chave}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-emerald-500">
                        {formatCurrency(row.entradas)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#f55f6f]">
                        {formatCurrency(row.saidas)}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-semibold ${
                          row.saldo >= 0 ? "text-[var(--color-text-primary)]" : "text-[#f55f6f]"
                        }`}
                      >
                        {formatCurrency(row.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="glass-card flex flex-col gap-4 p-6">
          <header className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Resumo geral
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Panorama do periodo selecionado.
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <InfoTile label="Total de entradas" value={formatCurrency(totals.entradas)} accent />
            <InfoTile label="Total de saidas" value={formatCurrency(totals.saidas)} negative />
            <InfoTile label="Saldo do periodo" value={formatCurrency(totals.saldo)} />
          </div>
        </aside>
      </section>
    </div>
  );
};

type FilterChipProps = {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const FilterChip = ({ isActive, onClick, children }: FilterChipProps) => (
  <button
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
      isActive
        ? "bg-[var(--color-accent)] text-white shadow-card"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
    }`}
  >
    {children}
  </button>
);

type InfoTileProps = {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
};

const InfoTile = ({ label, value, accent, negative }: InfoTileProps) => (
  <div className="rounded-3xl bg-[var(--color-surface-muted)] px-5 py-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      {label}
    </p>
    <p
      className={`mt-2 text-2xl font-semibold ${
        accent ? "text-[var(--color-accent)]" : negative ? "text-[#f55f6f]" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

export default ReportsPage;
