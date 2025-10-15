import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { NAVIGATION_ITEMS } from "../../constants/navigation";
import { isSectionVisible, useUIStore } from "../../store/ui";

export const MobileNav = () => {
  const hidden = useUIStore((s) => s.hiddenMenuSections);

  const items = NAVIGATION_ITEMS.filter((it) => isSectionVisible(it.key, hidden));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/80">
      <ul className="mx-auto flex max-w-6xl items-stretch justify-around gap-1 px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.key} className="min-w-0 flex-1">
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  clsx(
                    "group flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors",
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                  )
                }
              >
                <span
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    "transition-colors",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

