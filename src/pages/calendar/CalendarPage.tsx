import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BadgeCheck, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import {
  useAccounts,
  useCreateAccount,
  useToggleAccountStatus,
} from "../../hooks/useAccounts";
import type { AccountRecord } from "../../services/finance";
import { formatCurrency } from "../../utils/format";

type QuickAccountPayload = {
  title: string;
  amount: string;
  notes?: string;
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export const CalendarPage = () => {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const toggleStatus = useToggleAccountStatus();

  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthDays = useMemo(() => buildMonthMatrix(visibleMonth), [visibleMonth]);

  const accountsByDay = useMemo(() => groupAccountsByDay(accounts), [accounts]);

  const pendingCount = accounts.filter((account) => account.status !== "pago").length;
  const paidCount = accounts.length - pendingCount;

  const handleAddEvent = async ({ title, amount, notes }: QuickAccountPayload) => {
    if (!selectedDate) return;
    await createAccount.mutateAsync({
      title,
      amount,
      dueDate: selectedDate.toISOString().slice(0, 10),
      notes,
    });
  };

  const handleToggleStatus = (account: AccountRecord) => {
    const nextStatus =
      account.status === "pago" ? "pendente" : account.status === "pendente" ? "pago" : "pago";

    void toggleStatus.mutateAsync({ id: account.id, status: nextStatus });
  };

  const changeMonth = (offset: number) => {
    setVisibleMonth((current) => addMonths(current, offset));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="glass-card flex flex-col gap-4 p-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Calendario financeiro
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Visualize contas agendadas, vencimentos e lembretes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="rounded-3xl bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]">
              {format(visibleMonth, "MMMM yyyy", { locale: ptBR })}
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {weekDays.map((day) => (
            <span key={day} className="text-center">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const isCurrentMonth = isSameMonth(day, visibleMonth);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const dayKey = format(day, "yyyy-MM-dd");
                const dayAccounts = accountsByDay.get(dayKey) ?? [];

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`flex h-28 flex-col rounded-3xl border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-accent)]"
                    } ${!isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                      {format(day, "d")}
                    </span>
                    <div className="mt-2 flex flex-1 flex-col gap-1 overflow-hidden">
                      {dayAccounts.slice(0, 3).map((account) => (
                        <span
                          key={account.id}
                          className={`truncate rounded-2xl px-2 py-1 text-[10px] font-semibold text-white ${
                            account.status === "pago" ? "bg-[#00c6ae]" : "bg-[var(--color-accent)]"
                          }`}
                        >
                          {account.title}
                        </span>
                      ))}
                      {dayAccounts.length > 3 && (
                        <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                          +{dayAccounts.length - 3} contas
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <aside className="glass-card flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <BadgeCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Resumo do dia
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Selecione uma data no calendario para registrar uma conta.
            </p>
          </div>
        </header>

        {createAccount.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {createAccount.error.message ?? "Erro ao registrar nova conta."}
          </div>
        )}

        {toggleStatus.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {toggleStatus.error.message ?? "Nao foi possivel atualizar o status do evento."}
          </div>
        )}

        <div className="rounded-3xl bg-[var(--color-surface-muted)] px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Proxima data
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
              : "Nenhuma data selecionada"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-[var(--color-surface-muted)] px-4 py-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-500">
              Pendentes
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-500">
              {isLoading ? "..." : pendingCount}
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--color-surface-muted)] px-4 py-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">Pagos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-500">
              {isLoading ? "..." : paidCount}
            </p>
          </div>
        </div>

        <QuickAccountForm
          onAdd={handleAddEvent}
          hasSelectedDate={!!selectedDate}
          isSubmitting={createAccount.isPending}
        />

        {selectedDate && (
          <DayAccountsList
            day={selectedDate}
            accounts={accountsByDay.get(format(selectedDate, "yyyy-MM-dd")) ?? []}
            onToggle={handleToggleStatus}
          />
        )}
      </aside>
    </div>
  );
};

type QuickAccountFormProps = {
  onAdd: (payload: QuickAccountPayload) => void | Promise<void>;
  hasSelectedDate: boolean;
  isSubmitting: boolean;
};

const QuickAccountForm = ({ onAdd, hasSelectedDate, isSubmitting }: QuickAccountFormProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0,00");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onAdd({ title, amount, notes });
    setTitle("");
    setAmount("0,00");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
        Registrar nova conta
      </label>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={hasSelectedDate ? "Descricao da conta" : "Selecione uma data primeiro"}
        disabled={!hasSelectedDate || isSubmitting}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        required
        minLength={3}
      />
      <input
        type="text"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Valor (ex: 250,00)"
        disabled={!hasSelectedDate || isSubmitting}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        required
      />
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Observacoes (opcional)"
        rows={3}
        disabled={!hasSelectedDate || isSubmitting}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!hasSelectedDate || isSubmitting}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Plus className="h-4 w-4" />
        {isSubmitting ? "Registrando..." : "Adicionar ao calendario"}
      </button>
    </form>
  );
};
type DayAccountsListProps = {
  day: Date;
  accounts: AccountRecord[];
  onToggle: (account: AccountRecord) => void;
};

const DayAccountsList = ({ day, accounts, onToggle }: DayAccountsListProps) => {
  if (accounts.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-5 text-center text-sm text-[var(--color-text-muted)]">
        Nenhuma conta registrada para {format(day, "dd/MM")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Contas em {format(day, "dd/MM")}
      </h3>
      <div className="flex flex-col gap-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => onToggle(account)}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              account.status === "pago"
                ? "border-[#00c6ae] bg-[#00c6ae20] text-[#00c6ae]"
                : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-accent)]"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{account.title}</span>
              {account.notes && (
                <span className="text-xs text-[var(--color-text-muted)]">{account.notes}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {formatCurrency(account.amount)}
              </span>
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                {account.status === "pago" ? "Pago" : account.status === "pendente" ? "Pendente" : "Em atraso"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const buildMonthMatrix = (month: Date) => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};

const groupAccountsByDay = (accounts: AccountRecord[]) => {
  const map = new Map<string, AccountRecord[]>();
  accounts.forEach((account) => {
    const key = account.due_date;
    const current = map.get(key) ?? [];
    current.push(account);
    map.set(key, current);
  });
  return map;
};

export default CalendarPage;
