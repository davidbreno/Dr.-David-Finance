export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

export const parseCurrencyInput = (value: string) => {
  const sanitized = value.replace(/\./g, "").replace(",", ".");
  const numeric = Number(sanitized);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const formatDate = (date: string | Date) => {
  const instance = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(instance);
};
