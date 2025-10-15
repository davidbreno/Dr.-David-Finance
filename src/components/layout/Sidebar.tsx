import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { NAVIGATION_ITEMS } from "../../constants/navigation";
import { isSectionVisible, useUIStore } from "../../store/ui";

export const Sidebar = () => {
  const hiddenSections = useUIStore((state) => state.hiddenMenuSections);
  const sidebarVariant = useUIStore((state) => state.sidebarVariant);

  const items = useMemo(
    () => NAVIGATION_ITEMS.filter((item) => isSectionVisible(item.key, hiddenSections)),
    [hiddenSections],
  );

  const isHoverVariant = sidebarVariant === "hover";
  const iconSize = isHoverVariant ? "h-10 w-10" : "h-10 w-10";

  return (
    <aside
      className={clsx(
        "group/sidebar relative flex h-screen flex-col gap-6 overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-card transition-all duration-400 ease-in-out",
        isHoverVariant ? "w-[64px] hover:w-[268px]" : "w-[268px]",
        isHoverVariant ? "px-2 py-4" : "px-5 py-6",
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-bg)]/65 to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-hover/sidebar:opacity-100" />

      <div
        className={clsx(
          "flex items-center gap-3 transition-all duration-400 ease-in-out",
          isHoverVariant ? "justify-center group-hover/sidebar:justify-start" : "px-2",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl logo-pill transition-all duration-300 ease-in-out">
          <span className="logo-mark" />
        </div>
        <div
          className={clsx(
            "flex flex-col transition-opacity duration-400 ease-in-out",
            isHoverVariant ? "opacity-0 group-hover/sidebar:opacity-100" : "opacity-100",
          )}
        >
          <span className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-muted)] whitespace-nowrap">
            David Finance
          </span>
          <span className="text-lg font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
            Dashboard
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 py-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                clsx(
                  "group flex rounded-2xl py-3 font-medium text-[var(--color-text-muted)] transition-all duration-200 ease-in-out hover:text-[var(--color-text-primary)]",
                  isHoverVariant
                    ? "flex-col items-center justify-center gap-2 px-0 group-hover/sidebar:flex-row group-hover/sidebar:items-center group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:px-4"
                    : "items-center gap-3 px-4",
                  isActive && "bg-[var(--color-accent-soft)] text-[var(--color-text-primary)]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      "flex items-center justify-center rounded-xl bg-transparent transition-colors duration-200 ease-in-out",
                      iconSize,
                      isActive && "bg-[var(--color-accent)] text-white",
                      "group-hover:bg-[var(--color-accent)] group-hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={clsx(
                      "text-sm font-semibold transition-opacity duration-400 ease-in-out",
                      isHoverVariant
                        ? "opacity-0 group-hover/sidebar:opacity-100 whitespace-nowrap text-center"
                        : "opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
