import clsx from "clsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  amount: z
    .string()
    .min(1, "Informe um valor")
    .regex(/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/, "Use virgula para centavos. Ex: 1.520,00"),
  description: z.string().min(3, "Descreva o lancamento"),
  category: z.string().min(1, "Selecione uma categoria"),
  date: z.string().min(1, "Informe a data"),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof schema>;

type TransactionFormProps = {
  kind: "entrada" | "saida" | "conta";
  onSubmit?: (values: TransactionFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

const labels: Record<TransactionFormProps["kind"], { title: string; accent: string }> = {
  entrada: { title: "Registrar entrada", accent: "bg-[var(--color-accent)]" },
  saida: { title: "Registrar saida", accent: "bg-[#f55f6f]" },
  conta: { title: "Agendar conta", accent: "bg-[#00c6ae]" },
};

export const TransactionForm = ({ kind, onSubmit, isSubmitting = false }: TransactionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const handleFormSubmit = async (values: TransactionFormValues) => {
    try {
      await onSubmit?.(values);
      reset();
    } catch (error) {
      console.error("Falha ao registrar transacao", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="glass-card flex flex-col gap-5 p-6"
    >
      <header className="flex items-center justify-between">
        <div>
          <span
            className={clsx(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white",
              labels[kind].accent,
            )}
          >
            {kind}
          </span>
          <h2 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
            {labels[kind].title}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Preencha os detalhes para acompanhar suas financas.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            Valor
          </label>
          <input
            type="text"
            placeholder="Ex: 1.520,00"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            {...register("amount")}
          />
          {errors.amount && <span className="text-xs text-red-500">{errors.amount.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            Categoria
          </label>
          <select
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            {...register("category")}
          >
            <option value="">Selecione</option>
            <option value="vendas">Vendas</option>
            <option value="servicos">Servicos</option>
            <option value="investimentos">Investimentos</option>
            <option value="fixas">Despesas fixas</option>
            <option value="variaveis">Despesas variaveis</option>
          </select>
          {errors.category && (
            <span className="text-xs text-red-500">{errors.category.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            Descricao
          </label>
          <input
            type="text"
            placeholder="Ex: Consultoria financeira"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            {...register("description")}
          />
          {errors.description && (
            <span className="text-xs text-red-500">{errors.description.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Data</label>
          <input
            type="date"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            {...register("date")}
          />
          {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[var(--color-text-primary)]">
          Observacoes
        </label>
        <textarea
          placeholder="Detalhes adicionais importantes"
          rows={3}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          {...register("notes")}
        />
        {errors.notes && <span className="text-xs text-red-500">{errors.notes.message}</span>}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Limpar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Enviando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};
