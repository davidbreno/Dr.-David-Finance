const monthNames = new Intl.DateTimeFormat("pt-BR", { month: "short" });

const buildLastMonths = (months: number): Date[] => {
  const list: Date[] = [];
  const base = new Date();

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(base.getFullYear(), base.getMonth() - i, 1);
    list.push(date);
  }

  return list;
};

const getMonthKey = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
};

export const aggregateByMonth = (
  entries: Array<{ amount: number; date: string }>,
  exits: Array<{ amount: number; date: string }>,
  months = 12,
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
      month: monthNames.format(date).toUpperCase(),
      entradas: entryMap.get(key) ?? 0,
      saidas: exitMap.get(key) ?? 0,
    };
  });
};

export const aggregateCategories = (
  entries: Array<{ amount: number; category: string | null }>,
  exits: Array<{ amount: number; category: string | null }>,
  limit = 6,
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
    .slice(0, limit);
};
