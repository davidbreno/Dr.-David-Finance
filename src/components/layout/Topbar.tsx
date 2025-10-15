import { Bell, LogOut, Mail, Search } from "lucide-react";
import { useMemo } from "react";

import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../providers/AuthProvider";
import { useUIStore } from "../../store/ui";

const themeLabels: Record<string, string> = {
  aurora: "Aurora",
  dark: "Dark",
  nude: "Nude",
  sunset: "Sunset Glow",
  ocean: "Ocean Breeze",
  "neon-cyan": "Neon Cyan",
  obsidian: "Obsidian Gold",
  midnight: "Midnight Halo",
  studio: "Studio Dark",
};

export const Topbar = () => {
  const theme = useUIStore((state) => state.theme);
  const { user } = useAuth();

  const currentThemeLabel = useMemo(() => themeLabels[theme] ?? "Aurora", [theme]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "visitante";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="search"
            placeholder="Buscar em Finance David..."
            className="w-full rounded-full border border-transparent bg-[var(--color-surface)] px-12 py-3 text-sm text-[var(--color-text-primary)] shadow-card outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-card transition hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
            <Mail className="h-5 w-5" />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-card transition hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-2.5 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              {initials || "DF"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {displayName}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                Tema: {currentThemeLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

    </header>
  );
};
