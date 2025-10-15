// Debug helper (import available if needed for isolation)
// import { LabeledErrorBoundary } from "../../components/common/ErrorBoundary";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { useTransactions } from "../../hooks/useTransactions";
import { useAccounts } from "../../hooks/useAccounts";
import { formatCurrency } from "../../utils/format";

const monthNames = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const dayLabelFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});
const tooltipDateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const buildLastMonths = (months: number): Date[] => {
  const list: Date[] = [];
  const base = new Date();

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(base.getFullYear(), base.getMonth() - i, 1);
    list.push(date);
  }

  return list;
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
const buildLastDays = (days: number): Date[] => {
  const list: Date[] = [];
  const base = new Date();

  base.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(base);
    day.setDate(base.getDate() - i);
    list.push(day);
  }

  return list;
};

const getDayKey = (date: Date) => date.toISOString().slice(0, 10);

const aggregateByMonth = (
  entries: Array<{ amount: number; date: string }>,
  exits: Array<{ amount: number; date: string }>,
  months = 9,
) => {
  const monthsList = buildLastMonths(months);
  const entryMap = new Map<string, number>();
  const exitMap = new Map<string, number>();

  entries.forEach((item) => {
    const date = new Date(item.date);
    const key = getMonthKey(date);
    entryMap.set(key, (entryMap.get(key) ?? 0) + (item.amount ?? 0));
  });

  exits.forEach((item) => {
    const date = new Date(item.date);
    const key = getMonthKey(date);
    exitMap.set(key, (exitMap.get(key) ?? 0) + (item.amount ?? 0));
  });

  return monthsList.map((date) => {
    const key = getMonthKey(date);
    return {
      key,
      label: monthNames.format(date).toUpperCase(),
      entradas: entryMap.get(key) ?? 0,
      saidas: exitMap.get(key) ?? 0,
    };
  });
};

const aggregateCategories = (
  entries: Array<{ amount: number; category: string | null }>,
  exits: Array<{ amount: number; category: string | null }>,
) => {
  const map = new Map<
    string,
    {
      categoria: string;
      entradas: number;
      saidas: number;
    }
  >();

  const add = (
    source: Array<{ amount: number; category: string | null }>,
    field: "entradas" | "saidas",
  ) => {
    source.forEach((item) => {
      const categoria = (item.category ?? "Outros").toUpperCase();
      const bucket = map.get(categoria) ?? { categoria, entradas: 0, saidas: 0 };
      bucket[field] += item.amount ?? 0;
      map.set(categoria, bucket);
    });
  };

  add(entries, "entradas");
  add(exits, "saidas");

  return Array.from(map.values())
    .sort((a, b) => b.entradas + b.saidas - (a.entradas + a.saidas))
    .slice(0, 6);
};

type PerformancePoint = {
  key: string;
  date: string;
  label: string;
  profit: number;
  loss: number;
  cumulativeProfit: number;
  cumulativeLoss: number;
  cumulativeProfitLine: number;
  cumulativeLossLine: number;
};

const aggregatePerformance = (
  entries: Array<{ amount: number; date: string }>,
  exits: Array<{ amount: number; date: string }>,
  days = 16,
): PerformancePoint[] => {
  const totals = new Map<string, { entradas: number; saidas: number }>();

  const addAmount = (list: Array<{ amount: number; date: string }>, field: "entradas" | "saidas") => {
    list.forEach((item) => {
      const parsed = new Date(item.date);
      if (Number.isNaN(parsed.getTime())) return;
      parsed.setHours(0, 0, 0, 0);
      const key = getDayKey(parsed);
      const current = totals.get(key) ?? { entradas: 0, saidas: 0 };
      current[field] += item.amount ?? 0;
      totals.set(key, current);
    });
  };

  addAmount(entries, "entradas");
  addAmount(exits, "saidas");

  const daysList = buildLastDays(days);
  let cumulativeProfit = 0;
  let cumulativeLoss = 0;

  return daysList.map((date) => {
    const key = getDayKey(date);
    const bucket = totals.get(key) ?? { entradas: 0, saidas: 0 };
    const net = bucket.entradas - bucket.saidas;
    const profit = net > 0 ? net : 0;
    const loss = net < 0 ? net : 0;

    if (profit > 0) {
      cumulativeProfit += profit;
    }

    if (loss < 0) {
      cumulativeLoss += Math.abs(loss);
    }

    return {
      key,
      date: date.toISOString(),
      label: dayLabelFormat.format(date),
      profit,
      loss,
      cumulativeProfit,
      cumulativeLoss,
      cumulativeProfitLine: cumulativeProfit,
      cumulativeLossLine: cumulativeLoss > 0 ? -cumulativeLoss : 0,
    };
  });
};

const PerformanceTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload as PerformancePoint | undefined;

  if (!point) return null;

  const items = [
    {
      key: "cumulativeProfit",
      label: "Lucro acumulado",
      value: point.cumulativeProfit,
      color: "var(--color-profit)",
    },
    {
      key: "cumulativeLoss",
      label: "Prejuizo acumulado",
      value: point.cumulativeLoss,
      color: "var(--color-loss)",
    },
    {
      key: "profit",
      label: "Lucro do dia",
      value: point.profit,
      color: "var(--color-profit)",
    },
    {
      key: "loss",
      label: "Prejuizo do dia",
      value: Math.abs(point.loss),
      color: "var(--color-loss)",
    },
  ];

  return (
    <div className="flex min-w-[200px] flex-col gap-3 rounded-2xl border border-[rgba(120,130,170,0.25)] bg-[rgba(12,14,18,0.92)] px-4 py-3 text-white shadow-lg backdrop-blur-md">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
        {tooltipDateFormat.format(new Date(point.date))}
      </span>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-white/85">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
              {item.label}
            </span>
            <span className="font-semibold">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const [mounted, setMounted] = useState(false);
  const { data: entries = [] } = useTransactions("entrada");
  const { data: exits = [] } = useTransactions("saida");
  const { data: accounts = [] } = useAccounts();

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthly = useMemo(
    () =>
      aggregateByMonth(
        entries.map((item) => ({ amount: item.amount ?? 0, date: item.date })),
        exits.map((item) => ({ amount: item.amount ?? 0, date: item.date })),
      ),
    [entries, exits],
  );

  const performance = useMemo(
    () =>
      aggregatePerformance(
        entries.map((item) => ({ amount: item.amount ?? 0, date: item.date })),
        exits.map((item) => ({ amount: item.amount ?? 0, date: item.date })),
      ),
    [entries, exits],
  );

  const categories = useMemo(
    () =>
      aggregateCategories(
        entries.map((item) => ({ amount: item.amount ?? 0, category: item.category })),
        exits.map((item) => ({ amount: item.amount ?? 0, category: item.category })),
      ),
    [entries, exits],
  );

  const totalEntradas = useMemo(() => entries.reduce((sum, item) => sum + (item.amount ?? 0), 0), [entries]);
  const totalSaidas = useMemo(() => exits.reduce((sum, item) => sum + (item.amount ?? 0), 0), [exits]);
  const saldoAtual = totalEntradas - totalSaidas;

  const currentMonthKey = monthly.at(-1)?.key;
  const previousMonthKey = monthly.at(-2)?.key;

  const currentMonthEntradas = monthly.find((item) => item.key === currentMonthKey)?.entradas ?? 0;
  const previousMonthEntradas = monthly.find((item) => item.key === previousMonthKey)?.entradas ?? 0;

  const currentMonthSaidas = monthly.find((item) => item.key === currentMonthKey)?.saidas ?? 0;
  const previousMonthSaidas = monthly.find((item) => item.key === previousMonthKey)?.saidas ?? 0;

  const calcDelta = (current: number, previous: number) => {
    if (previous === 0) return "-";
    const delta = ((current - previous) / previous) * 100;
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}%`;
  };

  const overviewCards = [
    {
      title: "Saldo em caixa",
      value: formatCurrency(saldoAtual),
      delta: calcDelta(currentMonthEntradas - currentMonthSaidas, previousMonthEntradas - previousMonthSaidas),
    },
    {
      title: "Entradas do mes",
      value: formatCurrency(currentMonthEntradas),
      delta: calcDelta(currentMonthEntradas, previousMonthEntradas),
    },
    {
      title: "Saidas do mes",
      value: formatCurrency(currentMonthSaidas),
      delta: calcDelta(currentMonthSaidas, previousMonthSaidas),
    },
    {
      title: "Contas pendentes",
      value: `${accounts.filter((account) => account.status !== "pago").length}`,
      delta: accounts.length ? `${accounts.filter((acc) => acc.status === "pago").length} pagas` : "-",
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <div key={card.title} className="glass-card flex flex-col gap-3 p-6">
            <h3 className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {card.title}
            </h3>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">
              {card.value}
            </p>
            <span className="text-xs font-semibold text-[var(--color-accent)]">
              {card.delta} vs. mes anterior
            </span>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        {mounted && (
        <div className="glass-card flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Performance liquida
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Evolucao diaria do saldo combinando entradas e saidas.
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--color-accent)]">
              Ultimos 16 dias
            </span>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-[28px] bg-[var(--color-surface-muted)]/20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(120% 120% at 18% 10%, var(--color-profit-soft) 0%, rgba(0,0,0,0) 58%), radial-gradient(120% 120% at 82% 92%, var(--color-loss-soft) 0%, rgba(0,0,0,0) 60%)",
              }}
            />
            <ResponsiveContainer>
              <AreaChart data={performance}>
                <defs>
                  <linearGradient id="performanceProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-profit)" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="var(--color-profit)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="performanceLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-loss)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-loss)" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(120,130,170,0.12)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(120,130,170,0.18)" }}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  dy={4}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "rgba(120,130,170,0.18)" }}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  tickFormatter={(value: number) => formatCurrency(value)}
                  width={80}
                  domain={[
                    (dataMin: number) => {
                      if (!Number.isFinite(dataMin)) return -10;
                      if (dataMin === 0) return -10;
                      return dataMin < 0 ? dataMin * 1.2 : dataMin * 0.8;
                    },
                    (dataMax: number) => {
                      if (!Number.isFinite(dataMax)) return 10;
                      if (dataMax === 0) return 10;
                      return dataMax > 0 ? dataMax * 1.2 : dataMax * 0.8;
                    },
                  ]}
                />
                <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="6 6" />
                <Tooltip content={PerformanceTooltip} cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfitLine"
                  stroke="none"
                  fill="rgba(255,255,255,0.25)"
                  fillOpacity={0.18}
                  name="areaLucro"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeLossLine"
                  stroke="none"
                  fill="rgba(255,255,255,0.25)"
                  fillOpacity={0.18}
                  name="areaPrejuizo"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-profit)"
                  strokeWidth={2.5}
                  fill="url(#performanceProfit)"
                  name="Lucro"
                  activeDot={{ r: 5, fill: "var(--color-profit)", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="loss"
                  stroke="var(--color-loss)"
                  strokeWidth={2.5}
                  fill="url(#performanceLoss)"
                  name="Prejuizo"
                  activeDot={{ r: 5, fill: "var(--color-loss)", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeProfitLine"
                  stroke="var(--color-profit)"
                  strokeDasharray="6 6"
                  strokeWidth={1.5}
                  dot={false}
                  name="Lucro acumulado"
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeLossLine"
                  stroke="var(--color-loss)"
                  strokeDasharray="6 6"
                  strokeWidth={1.5}
                  dot={false}
                  name="Prejuizo acumulado"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {mounted && (
        <div className="glass-card flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Distribuicao por categoria
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Comparativo de entradas e saidas por categoria.
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--color-accent)]">
              Top 6 categorias
            </span>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-[28px] bg-[var(--color-surface-muted)]/20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(130% 130% at 80% 12%, var(--color-accent-soft) 0%, rgba(0,0,0,0) 58%), radial-gradient(130% 130% at 10% 88%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 64%)",
              }}
            />
            <ResponsiveContainer>
              <AreaChart data={categories}>
                <CartesianGrid stroke="rgba(120,130,170,0.12)" vertical={false} />
                <XAxis
                  dataKey="categoria"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(120,130,170,0.18)" }}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "rgba(120,130,170,0.18)" }}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  tickFormatter={(value: number) => formatCurrency(value)}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "rgba(12, 14, 18, 0.92)",
                    border: "1px solid rgba(120,130,170,0.2)",
                    borderRadius: "16px",
                    color: "var(--color-text-primary)",
                  }}
                />
                <defs>
                  <linearGradient id="areaEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-profit)" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="var(--color-profit)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="areaSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-loss)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--color-loss)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="entradas" stroke="var(--color-profit)" strokeWidth={2.5} fill="url(#areaEntradas)" />
                <Area type="monotone" dataKey="saidas" stroke="var(--color-loss)" strokeWidth={2.5} fill="url(#areaSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;


