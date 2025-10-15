import { useMemo } from "react";
import { MoonStar, Palette, Rows, StretchHorizontal } from "lucide-react";
import clsx from "clsx";

import { NAVIGATION_ITEMS } from "../../constants/navigation";
import { getVisibleSections, useUIStore } from "../../store/ui";
import type { MenuSection, SidebarVariant, ThemeOption } from "../../store/ui";

const themes: { key: ThemeOption; name: string; description: string }[] = [
  {
    key: "neon",
    name: "Neon",
    description: "Tema escuro com brilho neon e gradientes luminosos.",
  },
  {
    key: "obsidian",
    name: "Obsidian Gold",
    description: "Dark elegante com detalhes dourados e contrastes sofisticados.",
  },
];

const sidebarVariants: { key: SidebarVariant; title: string; description: string }[] = [
  {
    key: "pinned",
    title: "Fixa a esquerda",
    description: "A barra lateral permanece visivel o tempo todo.",
  },
  {
    key: "hover",
    title: "Recolhida (hover)",
    description: "A barra lateral expande apenas quando o cursor passa por cima.",
  },
];

const sectionLabels: Record<MenuSection, string> = {
  painel: "Painel",
  entradas: "Entradas",
  saidas: "Saidas",
  contas: "Contas",
  calendario: "Calendario",
  relatorios: "Relatorios",
  configuracoes: "Configuracoes",
};

export const SettingsPage = () => {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const hiddenSections = useUIStore((state) => state.hiddenMenuSections);
  const toggleMenuSection = useUIStore((state) => state.toggleMenuSection);
  const resetSections = useUIStore((state) => state.resetMenuSections);
  const sidebarVariant = useUIStore((state) => state.sidebarVariant);
  const setSidebarVariant = useUIStore((state) => state.setSidebarVariant);

  const visibleSections = useMemo(
    () => getVisibleSections(hiddenSections),
    [hiddenSections],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <section className="glass-card flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Palette className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Personalizacao de tema
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Escolha o visual ideal para a sua dashboard Finance David.
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {themes.map((item) => (
            <button
              key={item.key}
              onClick={() => setTheme(item.key)}
              className={clsx(
                "group flex flex-col gap-3 rounded-3xl border px-5 py-6 text-left transition",
                theme === item.key
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text-primary)] shadow-card"
                  : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-accent)]",
              )}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MoonStar className="h-4 w-4 text-[var(--color-accent)]" />
                {item.name}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card flex flex-col gap-4 p-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <StretchHorizontal className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Comportamento da sidebar
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Defina se a barra lateral sera fixa ou interativa.
            </p>
          </div>
        </header>

        <div className="grid gap-3">
          {sidebarVariants.map((option) => (
            <label
              key={option.key}
              className={clsx(
                "flex cursor-pointer items-start gap-3 rounded-3xl border px-4 py-4 transition",
                sidebarVariant === option.key
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-card"
                  : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-accent)]",
              )}
            >
              <input
                type="radio"
                checked={sidebarVariant === option.key}
                onChange={() => setSidebarVariant(option.key)}
                className="mt-1 accent-[var(--color-accent)]"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {option.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="glass-card flex flex-col gap-5 p-6 lg:col-span-2">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Rows className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Organizacao do menu
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Oculte secoes que voce nao utiliza com frequencia e mantenha o menu enxuto.
            </p>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {NAVIGATION_ITEMS.map((item) => {
            const isHidden = hiddenSections.includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => toggleMenuSection(item.key)}
                className={clsx(
                  "flex items-center justify-between rounded-3xl border px-4 py-3 text-sm font-semibold transition",
                  isHidden
                    ? "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
                    : "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text-primary)] shadow-card",
                )}
              >
                <span>{sectionLabels[item.key]}</span>
                <span className="text-xs uppercase tracking-wider">
                  {isHidden ? "Oculto" : "Visivel"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[var(--color-surface-muted)] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Secoes ativas
            </p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {visibleSections.map((section) => sectionLabels[section]).join(" - ")}
            </p>
          </div>
          <button
            onClick={resetSections}
            className="rounded-2xl border border-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-white"
          >
            Restaurar menu
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;


